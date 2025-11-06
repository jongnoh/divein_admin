=LET(
    week,
    IF($B19="", LOOKUP(2, 1/(ARRAYFORMULA($B$16:$B18<>"")), $B$16:$B18), $B19),
    firstIndex,
    MATCH(INT($E$14)+IF(week=1,0,week*7),ARRAYFORMULA(INT('DB_무신사 랭킹'!$I$2:$I)),0)+1 ,
    lastIndex,
    MATCH(INT($E$14)+(week*7),ARRAYFORMULA(INT('DB_무신사 랭킹'!$I$2:$I)),0),
    risingItems,
    weekRow,
    Match(week, $5:$5),
    filteredData,
    Filter(
    INDIRECT(
      "'DB_무신사 랭킹'!J" &
      firstIndex
      &
      ":J" &
      lastIndex
    ),

    INDIRECT(
      "'DB_무신사 랭킹'!G" &
      firstIndex
      &
      ":G" &
      lastIndex
    ) < INDIRECT(ADDRESS(6, weekRow)),

    INDIRECT(
      "'DB_무신사 랭킹'!E" &
      firstIndex
      &
      ":E" &
      lastIndex
    ) > INDIRECT(ADDRESS(8, weekRow)
    )
    ),
    uniqueData,
    UNIQUE(filteredData,),
    sortedData,
    SORT(uniqueData, COUNTIF(filteredData, uniqueData), FALSE)
    
)
