gameDifficultySettings = {
    "casual": {
        tileNumberDistributionOptions: [
            // score 0 ~ 4
            { min: 0, max: 0 },
            { min: 0, max: 0 },
            { min: 1, max: 1 },
            { min: 1, max: 2 },
            { min: 1, max: 3 },
            // score 5 ~ 9
            { min: 1, max: 4 },
            { min: 1, max: 5 },
            { min: 1, max: 6 },
            { min: 1, max: 7 },
            { min: 1, max: 8 },
            // score 10 ~ 14
            { min: 2, max: 9 },
            { min: 2, max: 10 },
            { min: 2, max: 11 },
            { min: 3, max: 12 },
            { min: 4, max: 13 },
            // score 15 ~ 19
            { min: 4, max: 14 },
            { min: 5, max: 15 },
            { min: 6, max: 16 },
            { min: 6, max: 17 },
            { min: 7, max: 18 },
            // score 20 ~ 24
            { min: 7, max: 19 },
            { min: 8, max: 20 },
            { min: 9, max: 21 },
            { min: 9, max: 22 },
            { min: 10, max: 23 },
            // score 25 ~ 30
            { min: 10, max: 24 },
            { min: 11, max: 25 },
            { min: 12, max: 26 },
            { min: 12, max: 27 },
            { min: 13, max: 28 },
            { min: 14, max: 29 },
        ],
        timePerNewRowPerStage: [
            14000,
            14000,
            14000,
            14000,
            14000
        ], //miliseconds
        insertTiesRule: [
            // [maxNumberOfTies, maxNumberOfMemberGroup, rowAffected]
            [0, 0, 0], // stage 1
            [2, 1, 2], // stage 2
            [2, 2, 2],
            [2, 3, 2],
            [3, 3, 2]
        ]
    },
    "moderate": {
        tileNumberDistributionOptions: [
            // score 0 ~ 4
            { min: 0, max: 0 },
            { min: 0, max: 0 },
            { min: 1, max: 1 },
            { min: 1, max: 2 },
            { min: 1, max: 3 },
            // score 5 ~ 9
            { min: 1, max: 4 },
            { min: 1, max: 5 },
            { min: 1, max: 6 },
            { min: 1, max: 7 },
            { min: 1, max: 8 },
            // score 10 ~ 14
            { min: 2, max: 9 },
            { min: 2, max: 10 },
            { min: 2, max: 11 },
            { min: 3, max: 12 },
            { min: 3, max: 13 },
            // score 15 ~ 19
            { min: 3, max: 14 },
            { min: 4, max: 15 },
            { min: 4, max: 16 },
            { min: 5, max: 17 },
            { min: 5, max: 18 },
            // score 20 ~ 24
            { min: 6, max: 19 },
            { min: 6, max: 20 },
            { min: 7, max: 21 },
            { min: 7, max: 22 },
            { min: 8, max: 23 },
            // score 25 ~ 30
            { min: 8, max: 24 },
            { min: 9, max: 25 },
            { min: 9, max: 26 },
            { min: 10, max: 27 },
            { min: 10, max: 28 },
            { min: 11, max: 29 },
        ],
        timePerNewRowPerStage: [
            12000,
            12000,
            12000,
            12000,
            12000
        ], //miliseconds
        insertTiesRule: [
            // [maxNumberOfTies, maxNumberOfMemberGroup, rowAffected]
            [0, 0, 0], // stage 1
            [2, 2, 2], // stage 2
            [3, 2, 2],
            [3, 3, 2],
            [3, 4, 2]
        ]
    },
    "tricky": {
        tileNumberDistributionOptions: [
            // score 0 ~ 4
            { min: 0, max: 0 },
            { min: 0, max: 0 },
            { min: 1, max: 1 },
            { min: 1, max: 2 },
            { min: 1, max: 3 },
            // score 5 ~ 9
            { min: 1, max: 4 },
            { min: 1, max: 5 },
            { min: 1, max: 6 },
            { min: 1, max: 7 },
            { min: 1, max: 8 },
            // score 10 ~ 14
            { min: 1, max: 9 },
            { min: 1, max: 10 },
            { min: 2, max: 11 },
            { min: 2, max: 12 },
            { min: 2, max: 13 },
            // score 15 ~ 19
            { min: 2, max: 14 },
            { min: 3, max: 15 },
            { min: 3, max: 16 },
            { min: 3, max: 17 },
            { min: 3, max: 18 },
            // score 20 ~ 24
            { min: 4, max: 19 },
            { min: 4, max: 20 },
            { min: 4, max: 21 },
            { min: 4, max: 22 },
            { min: 5, max: 23 },
            // score 25 ~ 30
            { min: 5, max: 24 },
            { min: 6, max: 25 },
            { min: 6, max: 26 },
            { min: 7, max: 27 },
            { min: 7, max: 28 },
            { min: 8, max: 29 },
        ],
        timePerNewRowPerStage: [
            12000,
            12000,
            12000,
            12000,
            12000
        ], //miliseconds
        insertTiesRule: [
            // [maxNumberOfTies, maxNumberOfMemberGroup, rowAffected]
            [0, 0, 0], // stage 1
            [2, 2, 2], // stage 2
            [3, 3, 2],
            [4, 3, 3],
            [5, 4, 3]
        ]
    },
    "expert": {
        tileNumberDistributionOptions: [
            // score 0 ~ 4
            { min: 0, max: 0 },
            { min: 0, max: 0 },
            { min: 1, max: 1 },
            { min: 1, max: 2 },
            { min: 1, max: 3 },
            // score 5 ~ 9
            { min: 1, max: 4 },
            { min: 1, max: 5 },
            { min: 1, max: 6 },
            { min: 1, max: 7 },
            { min: 1, max: 8 },
            // score 10 ~ 14
            { min: 1, max: 9 },
            { min: 1, max: 10 },
            { min: 1, max: 11 },
            { min: 1, max: 12 },
            { min: 1, max: 13 },
            // score 15 ~ 19
            { min: 1, max: 14 },
            { min: 2, max: 15 },
            { min: 2, max: 16 },
            { min: 2, max: 17 },
            { min: 2, max: 18 },
            // score 20 ~ 24
            { min: 3, max: 19 },
            { min: 3, max: 20 },
            { min: 3, max: 21 },
            { min: 3, max: 22 },
            { min: 3, max: 23 },
            // score 25 ~ 30
            { min: 3, max: 24 },
            { min: 4, max: 25 },
            { min: 4, max: 26 },
            { min: 5, max: 27 },
            { min: 5, max: 28 },
            { min: 6, max: 29 },
        ],
        timePerNewRowPerStage: [
            10500,
            10500,
            10500,
            10500,
            10500
        ], //miliseconds
        insertTiesRule: [
            // [maxNumberOfTies, maxNumberOfMemberGroup, rowAffected]
            [0, 0, 0], // stage 1
            [2, 2, 2], // stage 2
            [3, 3, 4],
            [4, 3, 6],
            [5, 4, 6]
        ]
        // insertTiesRule: [
        //     // [maxNumberOfTies, maxNumberOfMemberGroup, rowAffected]
        //     [0, 0, 0], // stage 1
        //     [2, 2, 2], // stage 2
        //     [4, 3, 4],
        //     [5, 3, 4],
        //     [6, 4, 6]
        // ]
    }
}