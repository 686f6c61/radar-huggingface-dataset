# tawkeed-sa/gpt-t1-max

## Resumen

GPT T1 Max es el modelo de lenguaje asociado al dispositivo Tawkeed T1 Max, desarrollado por Tawkeed (tawkeed-sa) como parte de la familia GPT T1. Segun la model card, se trata de una adaptacion del modelo base Qwen/Qwen3.5-397B-A17B, un transformer con arquitectura de mezcla de expertos (MoE) de 403.000 millones de parametros totales y aproximadamente 17.000 millones de parametros activos por token, con 512 expertos y 10 activos por token. El modelo acepta texto e imagenes como entrada (pipeline image-text-to-text) y declara una longitud de contexto de 262.144 tokens.

El repositorio publica actualmente los pesos originales BF16 del modelo base Qwen3.5-397B-A17B sin modificar, con un tamano aproximado de 807 GB. Segun el autor, estos pesos superan la memoria GPU del dispositivo T1 Max (cuatro NVIDIA RTX PRO 6000 Blackwell, 384 GB en total) y seran sustituidos por una compilacion cuantizada a 4 bits preparada por Tawkeed. Hasta entonces, los pesos sirven como fuente para cuantizacion o para ejecutarse en hardware con memoria suficiente.

La relevancia del modelo es limitada por su estado actual: no hay pesos especificos del dispositivo, no hay benchmarks publicados y el repositorio registra cero descargas. Su interes tecnico radica en la arquitectura MoE subyacente (Qwen3.5-397B-A17B) y en el planteamiento de despliegue en hardware Blackwell de cuatro GPU, pero la ficha debe interpretarse como la de un artefacto en transicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 512 expertos, 10 activos por token |
| Parametros totales | 403.397.928.944 (403B) |
| Parametros activos | Aproximadamente 17B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16 en el repositorio; build a 4 bits anunciada por Tawkeed (no publicada) |
| Idiomas soportados | Arabe (ar) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, aproximadamente 807 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos heredado del modelo base Qwen/Qwen3.5-397B-A17B: 512 expertos con 10 activos por token, lo que da un total de 403B parametros y unos 17B activos por inferencia. El modelo es multimodal de entrada, ya que acepta texto e imagenes (pipeline image-text-to-text). La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens procesados ni si hubo fases de RLHF o DPO; esa informacion corresponderia al modelo base y no se reproduce en el repositorio de Tawkeed.

No se documentan innovaciones tecnicas adicionales propias de Tawkeed mas alla del empaquetado para el dispositivo T1 Max. El repositorio contiene los pesos BF16 originales de Qwen sin cambios, por lo que las caracteristicas de entrenamiento y alineacion son las del modelo base, no verificadas de forma independiente en esta publicacion.

## Capacidades

- Generacion de texto conversacional en arabe e ingles.
- Procesamiento de entrada multimodal texto-imagen (image-text-to-text).
- Razonamiento y generacion de codigo y matematicas, segun las capacidades heredadas del modelo base Qwen3.5-397B-A17B.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional bilingue arabe-ingles: el modelo puede mantener dialogos multi-turno con contexto de hasta 262.144 tokens, lo que permite conservar historiales largos sin truncamiento en aplicaciones de atencion al cliente.
- Analisis de documentos extensos con imagenes: al aceptar texto e imagenes, puede procesar informes, facturas escaneadas o capturas junto con su texto asociado en una misma ventana de contexto.
- Despliegue en el dispositivo Tawkeed T1 Max: una vez publicada la build a 4 bits, el modelo esta pensado para ejecutarse en cuatro NVIDIA RTX PRO 6000 Blackwell con 384 GB de memoria total, en entornos on-premise.
- Generacion de codigo asistida: hereda las capacidades del modelo base Qwen3.5 en tareas de programacion, util para autocompletado y revision en IDE, aunque requiere hardware de alta gama.
- Investigacion sobre MoE a gran escala: el repositorio sirve como fuente de pesos BF16 para estudiar tecnicas de cuantizacion y enrutamiento de expertos en modelos de 403B parametros.
- Procesamiento de documentacion tecnica en arabe: el soporte nativo del arabe permite resumir y extraer informacion de corpus tecnicos y legales en ese idioma con contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos BF16 del repositorio: aproximadamente 807 GB, requieren hardware con memoria agregada muy superior a la del dispositivo objetivo.
- Dispositivo de referencia T1 Max: cuatro NVIDIA RTX PRO 6000 Blackwell Server Edition, 384 GB en total.
- Build a 4 bits anunciada por Tawkeed: no publicada; no se dispone de estimacion de VRAM verificada.
- Viabilidad en GPU de consumo: no disponible para los pesos BF16; la build cuantizada a 4 bits podria reducir el requisito, pero no hay datos publicados.
- Opciones de despliegue: el autor remite a las instrucciones de serving de Qwen/Qwen3.5-397B-A17B; no se especifican frameworks concretos (vLLM, llama.cpp, TGI, Ollama) en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| gpt-t1-max (Tawkeed) | 403B | ~17B | 262.144 | Apache-2.0 | Pesos BF16 del base; build 4 bits pendiente |
| Qwen/Qwen3.5-397B-A17B | 397B | ~17B | no disponible | Apache-2.0 | Modelo base de referencia |
| gpt-t1 (Tawkeed) | no disponible | no disponible | no disponible | Apache-2.0 | Basado en Qwen3.5-122B-A10B |
| gpt-t1-mini (Tawkeed) | no disponible | no disponible | no disponible | Apache-2.0 | Basado en Qwen3.8-27B |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene los pesos BF16 originales del modelo base sin modificaciones; no hay adaptacion especifica al dispositivo T1 Max todavia.
- Los pesos BF16 (aproximadamente 807 GB) no caben en los 384 GB de GPU del dispositivo T1 Max; la build a 4 bits esta anunciada pero no publicada.
- Solo se declaran arabe e ingles; el rendimiento en otros idiomas no esta garantizado.
- No hay benchmarks publicados, por lo que el rendimiento real no puede verificarse.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; heredados del modelo base Qwen3.5-397B-A17B.
- Licencia Apache-2.0: permite uso comercial, pero deben conservarse el texto de licencia y los avisos de atribucion a Qwen incluidos en `LICENSE`.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Soporte de tool calling, agentes y modo thinking no confirmado para esta publicacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tawkeed-sa/gpt-t1-max
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- gpt-t1 (variante T1): https://huggingface.co/tawkeed-sa/gpt-t1
- gpt-t1-mini (variante T1 Mini): https://huggingface.co/tawkeed-sa/gpt-t1-mini
- Sitio del autor: https://tawkeed.ai
