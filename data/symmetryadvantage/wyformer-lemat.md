# SymmetryAdvantage/WyFormer-LeMat

## Resumen

WyFormer-LeMat es un modelo generativo de estructuras cristalinas desarrollado por SymmetryAdvantage. Se trata de un generador incondicional de representaciones de Wyckoff: el modelo muestrea el grupo espacial, la composicion quimica y las posiciones de Wyckoff de un cristal, que posteriormente pueden relajarse a estructuras 3D completas mediante un potencial interatomico de machine learning (MLIP). Resuelve el problema del descubrimiento inverso de materiales, permitiendo generar candidatos cristalinos novedosos sin partir de una composicion o estructura objetivo.

El modelo emplea una arquitectura de transformer encoder de 4 capas sobre la tokenizacion `der_tokenizer_v1`, y fue entrenado sobre la porcion cercana al hull convexo del dataset LeMat-Bulk-fixed. Es relevante porque el descubrimiento de materiales metastables estables es un cuello de botella en ciencia de materiales, y este modelo ofrece un flujo de generacion mas filtrado por energia y novedad que aumenta el rendimiento de estructuras validas, unicas y novedosas (SUN).

Se distribuye bajo licencia Apache 2.0 a traves de la libreria `wyckoff-transformer`, con un volumen de descargas muy bajo (13) y sin likes, lo que indica un modelo reciente y de nicho. El repositorio no ocupa espacio apreciable (0.0 GB), lo que sugiere que los pesos se gestionan fuera del repositorio o mediante la propia libreria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 4 capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de dominio cientifico, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (gestionado via libreria `wyckoff-transformer`) |

## Arquitectura y entrenamiento

WyFormer-LeMat es un transformer encoder de 4 capas que opera sobre la tokenizacion `der_tokenizer_v1`, una representacion tokenizada de estructuras cristalinas en terminos de grupos espaciales, composiciones y posiciones de Wyckoff. El modelo es incondicional: no recibe una composicion ni un grupo espacial como entrada, sino que muestrea conjuntamente el grupo espacial, la composicion y las posiciones de Wyckoff, generando "genes" que luego se relajan a estructuras 3D con un MLIP.

El entrenamiento se realizo sobre LeMat-Bulk-fixed (revision `bf8f0b31`), filtrando a la region con fuerza residual ≤ 1 eV/Å y `e_hull ≤ 0.1` eV/atom respecto al hull PBE del dataset completo. La optimizacion uso AdamW con un schedule warmup-stable-decay y un learning rate pico de 7.5e-4, alcanzando una perdida de validacion de 18.22 (run de W&B `unconditional_5x_ehull01_h3x_xl_lr7p5e-4-20261018-202012`). No se documentan fases de RLHF ni DPO, lo cual es coherente con un modelo de dominio cientifico y no conversacional.

## Capacidades

- Generacion incondicional de representaciones de Wyckoff: muestrea grupo espacial, composicion quimica y posiciones de Wyckoff de forma conjunta.
- Generacion de candidatos cristalinos que pueden relajarse a estructuras 3D mediante un MLIP (por ejemplo, ORB v3 con `orb_conserv_inf`).
- Filtrado por novedad: el 46% de los genes del pool generado no estan presentes en LeMat-Bulk-fixed, lo que permite descubrir estructuras fuera del dataset de entrenamiento.
- Ranking por energia: compatible con WyFormer-LeMat-Energy para priorizar candidatos de menor energia sobre el hull.
- Seleccion por sorpresa: permite ordenar los genes por la perplejidad del generador (el 30% "menos sorprendente") para mejorar el rendimiento de estructuras metastables.
- No soporta tool calling, function calling, agentes, vision, audio ni capacidades multilingues: es un modelo especializado en generacion de estructuras cristalinas.

## Casos de uso

- Descubrimiento de materiales metastables: generar un pool de genes, relajarlos con un MLIP y filtrar por `e_hull ≤ 0.1` eV/atom para identificar estructuras novedosas y estables; el modelo reporta MetaSUN de hasta 0.758 con seleccion y ranking adecuados.
- Generacion de candidatos para sintesis: usar los genes generados como punto de partida para campanas de sintesis, priorizando los que el modelo considera menos sorprendentes y que ademas tienen baja energia.
- Aumento de datasets de materiales: generar estructuras novedosas (46% fuera de LeMat-Bulk-fixed) para ampliar conjuntos de entrenamiento de MLIPs o modelos de propiedades.
- Exploracion de espacios de grupos espaciales: muestrear grupos espaciales y composiciones poco representadas para estudiar tendencias estructurales.
- Filtrado previo a calculos DFT costosos: usar el ranking por energia y el filtrado por novedad para reducir el numero de relajaciones DFT necesarias antes de validar candidatos.
- Benchmarking de MLIPs: emplear los genes generados como banco de pruebas para evaluar la robustez de potenciales interatomicos en estructuras fuera de distribucion.

## Benchmarks y rendimiento

Evaluacion sobre un pool de 10.000 genes totalmente relajados con CrySPR y ORB v3 (`orb_conserv_inf`), con novedad medida contra LeMat-Bulk-fixed. MetaSUN cuenta estructuras con `e_hull ≤ 0.1` eV/atom validas, unicas y novedosas; las tasas son por gen relajado con un presupuesto de 1.000 relajaciones.

| Seleccion | MetaSUN | SUN |
|---|---:|---:|
| Las primeras 1.000 muestras | 0.382 | 0.009 |
| Los primeros 1.000 genes no presentes en LeMat-Bulk-fixed | 0.549 | 0.018 |
| Esos, ordenados por WyFormer-LeMat-Energy | 0.629 | 0.059 |
| Esos, el 30% que el generador encuentra menos sorprendente, luego ordenados | 0.758 | 0.047 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo es un transformer encoder de 4 capas, por lo que la huella deberia ser moderada, pero no se publican cifras.
- GPU recomendadas: no disponible. Por el tamano reducido (4 capas) es probable que quepa en GPUs de consumo, pero no se confirma en la informacion disponible.
- Compatibilidad con GPU de consumo: no confirmada explicitamente; el modelo se distribuye via la libreria `wyckoff-transformer`, no via formatos GGUF ni cuantizaciones estandar.
- Opciones de despliegue: `wyckoff-transformer` (instalacion via `pip install wyckoff-transformer`, comando `wyformer-generate genes.json.gz --hf-model SymmetryAdvantage/WyFormer-LeMat`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Condicionado | Licencia | Enfoque |
|---|---|---|---|---|
| WyFormer-LeMat | Transformer encoder 4 capas | No (incondicional) | Apache 2.0 | Generacion de Wyckoff sobre region cercana al hull |
| WyFormer-LeMat-Ehull | WyFormer | No | no disponible | Mayor rendimiento de estructuras metastables a `energy_above_hull=0.05` |
| WyFormer-LeMat-Energy | WyFormer | No | no disponible | Ranking por energia de los genes generados |

No se dispone de datos de parametros, contexto ni benchmarks de modelos alternativos de otros autores en la informacion proporcionada; la comparativa se limita a los modelos hermanos de la misma familia.

## Limitaciones y advertencias

- Modelo incondicional: no permite condicionar la generacion a una composicion o grupo espacial objetivo, lo que limita su uso en busquedas dirigidas.
- El 46% de los genes del pool no estan en LeMat-Bulk-fixed, por lo que el filtrado por novedad antes de relajar es critico; sin ese filtro el rendimiento MetaSUN cae a 0.382.
- Las tasas MetaSUN y SUN dependen del MLIP empleado (ORB v3) y del presupuesto de relajaciones (1.000); no se garantiza su transferibilidad a otros pipelines.
- No se documentan sesgos, riesgos de alucinacion en sentido linguistico ni limitaciones de idioma, al ser un modelo de dominio cientifico.
- Licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre los datos de entrenamiento (LeMat-Bulk-fixed).
- Perdida de validacion de 18.22 sin contextualizar respecto a lineas base; no se publican metricas de comparacion con otros generadores incondicionales.
- Volumen de adopcion muy bajo (13 descargas, 0 likes) y fecha de creacion reciente; no hay evidencia de validacion independiente.

## Enlaces

- HuggingFace: https://huggingface.co/SymmetryAdvantage/WyFormer-LeMat
- Modelo hermano WyFormer-LeMat-Ehull: https://huggingface.co/SymmetryAdvantage/WyFormer-LeMat-Ehull
- Modelo hermano WyFormer-LeMat-Energy: https://huggingface.co/SymmetryAdvantage/WyFormer-LeMat-Energy
- Repositorio GitHub WyckoffTransformer: https://github.com/SymmetryAdvantage/WyckoffTransformer
- Seccion de inferencia del README: https://github.com/SymmetryAdvantage/WyckoffTransformer#inference
- Dataset LeMat-Bulk-fixed: https://huggingface.co/datasets/kazeevn/LeMat-Bulk-fixed
