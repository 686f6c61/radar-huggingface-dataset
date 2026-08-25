# Taykhoom/UTR-LM-MLM

## Resumen

UTR-LM-MLM es un modelo de lenguaje para ARN (ácido ribonucleico) especializado en regiones 5' UTR (regiones no traducidas del extremo 5' del ARN mensajero). Se trata de un port minimo para HuggingFace de la variante MLM del modelo UTR-LM original, desarrollado por Yanyi Chu et al. y publicado en Nature Machine Intelligence en 2024. El modelo sigue una arquitectura estilo ESM2 con 6 capas transformer, 16 cabezas de atencion y dimension de embedding de 128, con un total de aproximadamente 1,2 millones de parametros.

El modelo fue preentrenado con el objetivo de modelado de lenguaje enmascarado (MLM) sobre secuencias 5' UTR endogenas de cinco especies (humano, raton, pez cebra, Drosophila y levadura) combinadas con una biblioteca sintetica aleatoria de 5' UTR. Su relevancia radica en que las regiones 5' UTR son determinantes criticos de la eficiencia de traduccion del ARN mensajero, y este modelo permite obtener representaciones (embeddings) de estas secuencias para tareas de prediccion de expresion genica y eficiencia traduccional.

Este checkpoint concreto es la version base con solo MLM, sin tareas supervisadas auxiliares, lo que lo convierte en un prior de lenguaje limpio y adecuado como baseline para tareas de transferencia basadas en embeddings. El port ha sido verificado bit a bit contra los pesos originales, garantizando paridad exacta en los 7 niveles de representacion (embedding inicial mas 6 bloques transformer).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo ESM2 con pre-LN y FFN GELU |
| Parametros totales | 1.207.970 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (1022 nucleotidos + `<cls>` / `<eos>`) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, soporta bfloat16) |
| Idiomas soportados | No aplica (vocabulario biologico: A, G, C, T) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer estilo ESM2 con normalizacion pre-LN (pre-layer normalization) y funciones de activacion GELU en la capa FFN. La configuracion incluye 6 capas, 16 cabezas de atencion, dimension de embedding de 128 y dimension oculta FFN de 512. El vocabulario es minimalista con solo 10 tokens: `<pad>`, `<eos>`, `<unk>`, las cuatro bases nucleotidicas (A, G, C, T), `<cls>`, `<mask>` y `<sep>`. El posicionamiento utiliza RoPE (Rotary Positional Embeddings) con base 10000.

El preentrenamiento se realizo con el objetivo de MLM con un 15% de enmascaramiento de tokens, sobre datos que combinan secuencias 5' UTR endogenas de cinco especies (humano, raton, pez cebra, Drosophila y levadura) con la biblioteca sintetica aleatoria de 5' UTR de Cao et al. El checkpoint de origen es `ESM2_1.4_five_species_TrainLossMin_6layers_16heads_128embedsize_4096batchToks.pkl`. Este modelo base no incluye tareas supervisadas auxiliares como prediccion de energia libre minima (MFE) o estructura secundaria, a diferencia de otras variantes de la familia UTR-LM.

Una innovacion destacable de este port es la verificacion de paridad bit a bit contra los pesos originales, con diferencia absoluta maxima de 0.00 en los 7 niveles de representacion. Ademas, soporta backends de atencion alternativos como SDPA (PyTorch 2.0+) y Flash Attention 2, ademas de la implementacion eager original.

## Capacidades

- Generacion de embeddings de secuencias 5' UTR: produce representaciones de 128 dimensiones por token y por secuencia (via token CLS).
- Modelado de lenguaje enmascarado: puede predecir nucleotidos enmascarados en secuencias 5' UTR.
- Extraccion de representaciones intermedias: permite acceder a las representaciones de cualquiera de las 6 capas transformer.
- Fine-tuning para tareas downstream: sigue convenciones estandar de HuggingFace y puede ajustarse con cualquier Trainer compatible.
- Soporte de atencion eficiente: compatible con SDPA y Flash Attention 2 para acelerar la inferencia.
- Capacidad multilingue: no aplica, al ser un modelo biologico con vocabulario de nucleotidos.

## Casos de uso

- Prediccion de eficiencia traduccional: el modelo puede fine-tuning con un head de regresion sobre el embedding CLS para predecir la eficiencia de traduccion del ARN mensajero a partir de la secuencia 5' UTR, como se hizo en el paper original de UTR-LM.
- Prediccion de niveles de expresion genica: las representaciones de 5' UTR pueden alimentar modelos de regresion para estimar niveles de expresion, util en diseno de vectores de expresion y terapias genicas.
- Diseno de secuencias 5' UTR sinteticas: el modelo puede usarse para generar o evaluar secuencias 5' UTR optimizadas para maximizar la traduccion en aplicaciones de biologia sintetica y desarrollo de vacunas de ARNm.
- Analisis de regulacion traduccional: los embeddings pueden usarse para estudiar como variaciones en la secuencia 5' UTR afectan la regulacion de la traduccion en diferentes contextos celulares.
- Transfer learning en genomica: sirve como modelo base preentrenado para tareas especificas de ARN donde los datos etiquetados son escasos, aprovechando el preentrenamiento en multiples especies.
- Investigacion en biologia computacional: util como baseline limpio (solo MLM) para comparar el efecto de objetivos auxiliares (MFE, estructura secundaria) en tareas de prediccion, comparandolo con las otras variantes de la familia UTR-LM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye metricas de rendimiento en tareas estandar como prediccion de eficiencia traduccional o expresion genica. Para datos de rendimiento, se recomienda consultar el articulo original de UTR-LM publicado en Nature Machine Intelligence (doi: 10.1038/s42256-024-00823-9).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero con 1,2 millones de parametros y contexto de 1024 tokens, el modelo es extremadamente ligero y cabe en cualquier GPU moderna, incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una GPU consumer como NVIDIA GTX 1650 o superior puede ejecutar el modelo sin problemas.
- Compatibilidad con consumer GPU: si, el modelo es compatible con cualquier GPU consumer actual.
- Opciones de despliegue: transformers de HuggingFace con PyTorch, soporte de SDPA (PyTorch 2.0+) y Flash Attention 2 (requiere instalacion de flash-attn).
- Latencia y throughput: no disponible, pero dado el tamano del modelo, la inferencia es practicamente instantanea en GPU y muy rapida incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo preentrenamiento | Licencia |
|---|---|---|---|---|
| UTR-LM-MLM (este modelo) | 1,2 M | 1024 tokens | MLM | GPL-3.0 |
| UTR-LM-MLMSI | 1,2 M | 1024 tokens | MLM + regresion MFE | GPL-3.0 |
| UTR-LM-MLMSS | 1,2 M | 1024 tokens | MLM + estructura secundaria | GPL-3.0 |
| UTR-LM-MLMSISS | 1,2 M | 1024 tokens | MLM + MFE + estructura secundaria | GPL-3.0 |

Las tres variantes alternativas pertenecen a la misma familia UTR-LM y comparten arquitectura y tamano. La diferencia radica en los objetivos auxiliares de preentrenamiento: MLMSI anade regresion de energia libre minima (recomendado para tareas de eficiencia traduccional y expresion), MLMSS anade prediccion de estructura secundaria, y MLMSISS combina ambos (recomendado para tareas de MRL, mRNA representation learning). Este modelo MLM puro sirve como baseline para aislar el efecto de dichos objetivos auxiliares.

## Limitaciones y advertencias

- Vocabulario limitado a ADN (A, G, C, T): las secuencias de ARN deben convertir uracilo (U) a timina (T) antes de la tokenizacion; un literal U se mapea a `<unk>`.
- Longitud maxima de secuencia: 1022 nucleotidos mas tokens especiales; secuencias 5' UTR mas largas no son soportadas.
- Sesgos de datos: el preentrenamiento se realizo sobre cinco especies concretas y una biblioteca sintetica; el rendimiento en otras especies puede verse degradado.
- Licencia GPL-3.0: restricciones copyleft para uso comercial y distribucion de derivados; cualquier modelo fine-tuning derivado debe distribuirse bajo la misma licencia.
- Modelo base sin tareas supervisadas: al ser solo MLM, puede requerir fine-tuning para tareas especificas; las variantes con objetivos auxiliares pueden ofrecer mejor rendimiento en tareas de traduccion y expresion.
- Codigo personalizado: requiere `trust_remote_code=True` al cargar desde HuggingFace, lo que implica ejecutar codigo remoto.
- Sin soporte de tool calling ni capacidades de agente: es un modelo de embeddings y MLM, no un modelo generativo conversacional.

## Enlaces

- HuggingFace: https://huggingface.co/Taykhoom/UTR-LM-MLM
- Coleccion UTR-LM en HuggingFace: https://huggingface.co/collections/Taykhoom/utr-lm-6a173a96ae7c070c3a84ebb4
- Repositorio GitHub original: https://github.com/a96123155/UTR-LM
- Documentacion en MultiMolecule: https://multimolecule.danling.org/models/utrlm/
- Ficha en bio.rodeo: https://bio.rodeo/models/5-utr-lm
- Articulo original (Nature Machine Intelligence, 2024): doi: 10.1038/s42256-024-00823-9
