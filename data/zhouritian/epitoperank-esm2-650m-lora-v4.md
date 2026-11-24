# ZhouRitian/epitoperank-esm2-650m-lora-v4

## Resumen

EpitopeRank v4 es un adaptador LoRA sobre el modelo de lenguaje de proteinas ESM-2 de 650 millones de parametros (`facebook/esm2_t33_650M_UR50D`), desarrollado por el usuario ZhouRitian. Su proposito es puntuar la inmunogenicidad de peptidos presentados por HLA de clase I en el contexto de neoantigenos tumorales, combinando la secuencia del peptido (8-14 aminoacidos) con una pseudosecuencia de 34 aminoacidos que representa el surco de union del alelo HLA-I. El resultado es un score de probabilidad que busca complementar, no sustituir, a predictores de union como NetMHCpan o MHCflurry.

La relevancia del modelo reside en su enfoque: en lugar de predecir unicamente la afinidad de union peptido-MHC, intenta modelar la inmunogenicidad observada experimentalmente, una senal mucho mas ruidosa y escasa. La version v4 introduce un ensemble de 5 pliegues con entrenamiento en dos etapas, lo que eleva el AUROC en conjunto de test independiente de 0.5474 (v3) a 0.7817, y el AUPRC de 0.2910 a 0.6056.

Arquitectonicamente es un adaptador ligero: solo se distribuyen los pesos LoRA (r=16, alpha=32) y la cabeza de clasificacion con attention pooling, no el modelo base completo. El repositorio ocupa 0.2 GB y esta pensado para cargarse sobre ESM-2-650M mediante la libreria PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESM-2 (transformer) + adaptador LoRA + cabeza de clasificacion con attention pooling |
| Parametros totales | no disponible (modelo base ESM-2 de 650M; adaptador LoRA de rango 16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada disenada para peptido de 8-14 aa + pseudosecuencia HLA de 34 aa) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de secuencias proteicas, no de texto natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de ESM-2 `esm2_t33_650M_UR50D`, un transformer de 33 capas y 650 millones de parametros preentrenado sobre secuencias de proteinas (UniRef50). Sobre el se aplica un adaptador LoRA de rango 16 y alpha 32, junto con una cabeza de clasificacion que emplea attention pooling sobre las representaciones del peptido para producir un score de inmunogenicidad. La entrada es una secuencia doble: `<cls> peptido (8-14 aa) <eos> pseudosecuencia_HLA_34aa <eos>`, donde la pseudosecuencia representa el surco de union de 18 alelos HLA-I humanos frecuentes, siguiendo el formato estandar de NetMHCpan.

El entrenamiento se realizo en dos etapas. La primera etapa hace un precalentamiento con muestras negativas mixtas: negativos experimentales de IEDB, proteinas normales humanas de UniProt, negativos por HLA mal emparejado y trampas de secuencias barajadas o de baja complejidad, con el objetivo de que el modelo aprenda especificidad HLA y union pMHC. La segunda etapa afina con un learning rate bajo sobre pares positivos y negativos puramente experimentales, aplicando temperature scaling sobre el conjunto de validacion para calibrar las probabilidades.

Para evitar fuga de datos, el split se realizo agrupando peptidos por similitud de 3-meros y usando `StratifiedGroupKFold(n_splits=5)`, garantizando que secuencias homologas no aparezcan en folds distintos. El modelo final es un ensemble de los 5 folds.

## Capacidades

- Puntuacion de inmunogenicidad de peptidos de 8 a 14 aminoacidos en el contexto de un alelo HLA-I concreto.
- Codificacion conjunta peptido + pseudosecuencia HLA de 34 aa, lo que permite modelar especificidad alelica.
- Discriminacion HLA-aware: el score cambia sustancialmente cuando se empareja el peptido con un HLA incorrecto (diferencias medias de +0.2765 en el conjunto de test).
- Interpretabilidad parcial mediante attention pooling sobre la secuencia del peptido.
- Integracion con pipelines de priorizacion de neoantigenos junto a predictores de union (NetMHCpan, MHCflurry).
- No soporta tool calling, agentes, generacion de texto, vision ni audio: es un modelo discriminativo de secuencias proteicas.
- No es multilingue en sentido linguistico; opera sobre el alfabeto de aminoacidos.

## Casos de uso

- Priorizacion de neoantigenos en pipelines de vacunas personalizadas: dado un listado de peptidos mutantes derivados de secuenciacion tumoral y los alelos HLA del paciente, el modelo puntua cada par peptido-HLA y permite ordenar candidatos combinando el score de union (NetMHCpan) con el de inmunogenicidad.
- Filtrado secundario tras NetMHCpan/MHCflurry: los predictores clasicos priorizan union; EpitopeRank v4 actua como segunda capa para descartar peptidos que se unen bien pero tienen baja probabilidad de inmunogenicidad observada.
- Analisis de especificidad alelica en cohortes: al comparar el score del peptido con su HLA correcto frente a HLA mal emparejados se puede detectar si una llamada de neoantigeno depende de un alelo concreto o es un artefacto.
- Investigacion en antigenos de cancer compartidos: el modelo se ha evaluado con KRAS G12D, MAGE-A3, HER2/neu, MART-1 y NY-ESO-1, por lo que es util para estudios comparativos de antigenos canonigos.
- Seleccion de candidatos para validacion experimental: reduce el numero de peptidos que pasan a ensayos de tetramero o ELISpot, ahorrando coste en experimentos de validacion.
- Docencia y prototipado en inmunoinformatica: al ser un adaptador ligero (0.2 GB) sobre ESM-2, se puede desplegar en entornos academicos con recursos limitados para explorar la relacion entre secuencia y respuesta T.

## Benchmarks y rendimiento

Resultados reportados por el autor en conjunto de test independiente con HLA-I explicito:

| Metrica | v3 (single fold) | v3.5 (dos etapas, single fold) | v4 (dos etapas + 5-fold) |
|---|---:|---:|---:|
| Hard AUROC | 0.5474 | 0.5911 | 0.7817 |
| Hard AUPRC | 0.2910 | 0.3270 | 0.6056 |
| Media en epitopos clasicos y antigenos tumorales | 0.5904 | 0.5840 | 0.7031 |
| Diferencia HLA correcto - HLA mal emparejado | +0.2330 | +0.2049 | +0.2765 |

Resultados por antigeno (v4, ensemble de 5 folds):

| Antigeno | Peptido | HLA correcto (score) | HLA mal emparejado (score) | Diferencia |
|---|---|---|---:|---:|---:|
| KRAS G12D | VVVGADGVGK | HLA-A*11:01: 0.8074 | HLA-A*02:01: 0.3040 | +0.5034 |
| MAGE-A3 | KVAELVHFL | HLA-A*02:01: 0.7382 | HLA-A*11:01: 0.2926 | +0.4456 |
| HER2/neu | KIFGSLAFL | HLA-A*02:01: 0.7399 | HLA-A*03:01: 0.4876 | +0.2523 |
| MART-1 | ELAGIGILTV | HLA-A*02:01: 0.7124 | HLA-B*07:02: 0.5182 | +0.1942 |
| NY-ESO-1 | SLLMWITQC | HLA-A*02:01: 0.6420 | HLA-B*07:02: 0.3470 | +0.2950 |

No se han publicado comparaciones directas con NetMHCpan, MHCflurry ni otros modelos de inmunogenicidad en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0.2 GB, pero requiere cargar el modelo base ESM-2-650M (unos 2.5 GB en fp32, ~1.3 GB en fp16).
- VRAM estimada para inferencia: entre 3 y 4 GB en fp16 para el conjunto base + adaptador, con margen para batches pequenos.
- Cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4090; tambien en GPUs profesionales A100, H100, L4 o T4.
- En CPU es viable para inferencia por lotes pequenos, aunque con mayor latencia.
- Opciones de despliegue: Hugging Face Transformers + PEFT (carga estandar), integracion en pipelines Python con `transformers` y `peft`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que estan orientadas a modelos generativos de texto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EpitopeRank v4 (este) | LoRA sobre ESM-2 | 650M base + adaptador | no disponible | Inmunogenicidad HLA-aware | apache-2.0 | Hugging Face |
| NetMHCpan | Predictor de union pMHC | no disponible | no aplica | Union peptido-MHC | academica (requiere licencia) | Servidor web / binario |
| MHCflurry | Predictor de presentacion | no disponible | no aplica | Presentacion y procesamiento | BSD-2 / academica | GitHub / pip |
| ESM-2 base (`esm2_t33_650M_UR50D`) | Protein LM | 650M | 1024 tokens | Representaciones generales | MIT | Hugging Face |

La comparacion con NetMHCpan y MHCflurry no es directa: esos modelos predicen union o presentacion, mientras que EpitopeRank v4 pretende predecir inmunogenicidad observada. No se dispone de una comparacion head-to-head publicada en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es una herramienta de priorizacion computacional; sus scores no constituyen prueba de inmunogenicidad ni de seguridad clinica.
- El AUROC en test independiente (0.7817) es moderado; el AUPRC (0.6056) indica que en regimenes de baja prevalencia de positivos el numero de falsos positivos puede ser alto.
- La cobertura de alelos HLA se limita a 18 alelos HLA-I frecuentes; peptidos restringidos por alelos no incluidos pueden recibir scores poco fiables.
- Solo cubre HLA de clase I y peptidos de 8-14 aminoacidos; no modela presentacion por HLA de clase II ni procesamiento antigenico completo.
- El entrenamiento se apoya en datos de IEDB y UniProt; los sesgos de esos repositorios (sobrerrepresentacion de ciertos antigenos y alelos) pueden propagarse al modelo.
- No se documentan evaluaciones de calibracion fuera del conjunto de validacion ni estudios prospectivos.
- La model card advierte explicitamente de la necesidad de combinar el modelo con predictores de union, cribado contra el proteoma normal para descartar reactividad cruzada y validacion humeda.
- Licencia apache-2.0 permite uso comercial, pero el modelo base ESM-2 tiene su propia licencia (MIT segun el repositorio de Meta) que debe respetarse al redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso independiente ni replicacion de resultados por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZhouRitian/epitoperank-esm2-650m-lora-v4
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ZhouRitian/epitoperank-esm2-demo
- Modelo base ESM-2: https://huggingface.co/facebook/esm2_t33_650M_UR50D
- IEDB (fuente de datos de referencia): https://www.iedb.org/
- NetMHCpan (predictor complementario): https://services.healthtech.dtu.dk/service.php?NetMHCpan-4.1
- MHCflurry (predictor complementario): https://github.com/openvax/mhcflurry
