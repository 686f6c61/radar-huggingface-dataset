# TigreGotico/nllb_200_distilled_600m-eng-yor-onnx

## Resumen

`TigreGotico/nllb_200_distilled_600m-eng-yor-onnx` es una exportación a formato ONNX del modelo `dsfsi/nllb_200_distilled_600m-eng-yor`, un ajuste fino de `facebook/nllb-200-distilled-600M` especializado en traducción de inglés a yoruba. El modelo original fue entrenado por el grupo DSFSI (Data Science for Social Impact) de la Universidad de Pretoria sobre el conjunto de datos `afriscience-mt`. Este repositorio se limita a convertir los pesos a ONNX (fp32 e int8 dinámico) sin modificar el comportamiento del modelo.

La relevancia de esta ficha reside en dos factores. Por un lado, cubre un par de idiomas de bajos recursos (inglés-yoruba) para el que existen pocos modelos abiertos de calidad. Por otro, ofrece una versión int8 de 1,9 GB que reduce a la cuarta parte el peso del fp32 original (~7,4 GB), lo que facilita el despliegue en entornos con recursos limitados mediante ONNX Runtime.

Arquitectura transformer encoder-decoder tipo M2M-100 (la base de la familia NLLB), con aproximadamente 600 millones de parámetros y licencia Apache-2.0. El checkpoint usa las etiquetas de idioma FLORES (`eng_Latn`, `yor_Latn`) en lugar de códigos ISO 639-1, un detalle crítico para su uso correcto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia NLLB, base M2M-100 distilled) |
| Parametros totales | ~600 millones (heredados de nllb-200-distilled-600M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (NLLB-200 soporta secuencias de hasta 512 tokens; no confirmado para este checkpoint) |
| Tipos de cuantizacion | fp32 y int8 dinamico por canal (ONNX Runtime `quantize_dynamic`, `QuantType.QInt8`, `per_channel=True`) |
| Idiomas soportados | ingles (en) y yoruba (yo); direccion de traduccion: `eng_Latn` -> `yor_Latn` |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx` + `.onnx_data` externos), fp32 en raiz e int8 en `int8/` |

## Arquitectura y entrenamiento

El modelo es una exportacion ONNX del checkpoint `dsfsi/nllb_200_distilled_600m-eng-yor`, que a su vez es un ajuste fino de `facebook/nllb-200-distilled-600M`. La arquitectura subyacente es la de NLLB-200 distilled: un transformer encoder-decoder con atencion multi-cabeza estandar, entrenado originalmente por Meta sobre datos multilingues masivos y destilado a 600M de parametros. El ajuste fino de DSFSI se realizo sobre el dataset `afriscience-mt`, orientado a contenido cientifico en lenguas africanas.

La exportacion se genero con `optimum-cli export onnx --task text2text-generation-with-past --no-post-process`, preservando la cache de atencion (`use_cache=True`). La variante int8 se obtuvo aplicando cuantizacion dinamica de ONNX Runtime grafo a grafo, con pesos en archivos externos (`int8/<graph>.onnx_data`) y `EnableSubgraph=True`. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO en el ajuste fino.

## Capacidades

- Traduccion automatica unidireccional de ingles a yoruba (etiquetas `eng_Latn` -> `yor_Latn`).
- Generacion de texto condicionada por `forced_bos_token_id` en tiempo de generacion.
- Decodificacion greedy y beam search (el autor reporta paridad exacta con PyTorch en ambos modos sobre una muestra de 10 frases).
- Inferencia con cache de atencion (`use_cache=True`) para acelerar la generacion autoregresiva.
- Ejecucion en ONNX Runtime, incluyendo la variante int8 dinamica.
- No soporta tool calling, function calling, agentes, vision, audio ni modos de razonamiento extendido.

## Casos de uso

- Traduccion de documentacion cientifica al yoruba: el ajuste fino sobre `afriscience-mt` lo hace adecuado para articulos y material academico en ese dominio, aunque conviene validar terminologia tecnica con revisores nativos.
- Localizacion de interfaces y textos de producto: la variante int8 de 1,9 GB permite integrar el modelo en servicios de traduccion de bajo coste con ONNX Runtime.
- Traduccion por lotes en pipelines de datos: el formato ONNX con pesos externos facilita el despliegue en contenedores y entornos serverless sin dependencia de PyTorch.
- Preservacion linguistica y proyectos comunitarios: al ser Apache-2.0, permite redistribucion y adaptacion por parte de comunidades yoruba-hablantes.
- Subtitulado y transcripcion traducida: combinado con un ASR en ingles, puede generar subtitulos en yoruba para contenido educativo o divulgativo.
- Sistemas de traduccion asistida en entornos con GPU modestas: la version int8 reduce requisitos de memoria y hace viable la inferencia en hardware consumer.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye mediciones de chrF y paridad fp32/int8 que sirven como referencia metodologica.

## Benchmarks y rendimiento

| Prueba | Build | Tamano | Metrica | Resultado |
|---|---|---|---|---|
| Paridad vs PyTorch (n=10, greedy) | fp32 | ~7,4 GB | exact match | 100% (10/10) |
| Paridad vs PyTorch (n=10, beam=4) | fp32 | ~7,4 GB | exact match | 100% (10/10) |
| FLORES-200 devtest (50 frases, greedy) | fp32 | 7,4 GB | chrF | 31,73 |
| FLORES-200 devtest (50 frases, greedy) | int8 | 1,9 GB | chrF | 31,94 |
| Salidas identicas a fp32 (FLORES-200, 50 frases) | int8 | 1,9 GB | coincidencia exacta | 16/50 |

El propio autor advierte que la muestra de 10 frases es pequena y ruidosa, y que una evaluacion a escala FLORES con chrF la sustituye cuando esta disponible. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8-10 GB para fp32 (pesos de 7,4 GB mas activaciones y cache), y alrededor de 2,5-3 GB para int8.
- GPU recomendadas: A100, H100 o L40S para throughput alto en fp32; T4, RTX 3060 12 GB, RTX 4070 o superiores para int8.
- Cabe en GPU consumer: si, especialmente la variante int8 en GPUs con 4 GB o mas de VRAM; la fp32 requiere al menos 10-12 GB para trabajar con comodidad.
- Opciones de despliegue: ONNX Runtime (via `optimum.onnxruntime.ORTModelForSeq2SeqLM`), servicios propios sobre ORT, o exportacion adicional a otros runtimes compatibles con ONNX. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| TigreGotico/nllb_200_distilled_600m-eng-yor-onnx | ~600M | no disponible | en -> yo | Apache-2.0 | ONNX (fp32, int8) |
| dsfsi/nllb_200_distilled_600m-eng-yor | ~600M | no disponible | en -> yo | Apache-2.0 | PyTorch (safetensors/bin) |
| facebook/nllb-200-distilled-600M | ~600M | no disponible | 200 idiomas | CC-BY-NC-4.0 (uso no comercial) | PyTorch |
| facebook/m2m100_418M | ~418M | no disponible | 100 idiomas | MIT | PyTorch |

La ventaja principal frente al checkpoint original de DSFSI es el formato ONNX y la variante int8; frente a `nllb-200-distilled-600M` gana en licencia (Apache-2.0 frente a CC-BY-NC-4.0) y en especializacion al par en-yo, a costa de perder cobertura multilingue.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de ingles a yoruba; no se documenta la direccion inversa.
- Requiere pasar `forced_bos_token_id` con la etiqueta `yor_Latn` en cada llamada; `generation_config.json` no lo fija.
- La evaluacion de paridad se basa en 10 frases; el propio autor advierte que es una senal inicial, no una garantia.
- chrF de ~31,7 en FLORES-200 (50 frases) indica calidad moderada; no es un modelo de traduccion de alta fidelidad.
- La cuantizacion int8 altera las salidas en 34 de 50 frases respecto a fp32, aunque el chrF agregado se mantiene.
- Riesgo de alucinacion y de traducciones literales en vocabulario tecnico fuera del dominio `afriscience-mt`.
- Sesgos inheridos del corpus NLLB y del dataset de ajuste fino; no se documentan analisis de sesgo.
- Licencia Apache-2.0 permite uso comercial, pero la atribucion a DSFSI y a Meta (NLLB) debe mantenerse.
- El repositorio ocupa 15,1 GB por incluir fp32 e int8; conviene descargar solo la variante necesaria.
- No soporta tool calling, agentes ni multimodalidad; su uso en produccion debe limitarse a traduccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TigreGotico/nllb_200_distilled_600m-eng-yor-onnx
- Modelo base: https://huggingface.co/dsfsi/nllb_200_distilled_600m-eng-yor
- Modelo original NLLB: https://huggingface.co/facebook/nllb-200-distilled-600M
- Repositorio de scripts de exportacion: https://github.com/TigreGotico/linguonnx
- DSFSI (Universidad de Pretoria): https://dsfsi.github.io/
- Paper de NLLB-200: https://arxiv.org/abs/2207.04672
