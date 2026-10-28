# tpnlabs/LFM2.5-1.2B-Instruct-TPN-GGUF

## Resumen

`tpnlabs/LFM2.5-1.2B-Instruct-TPN-GGUF` es una redistribución en formato GGUF del modelo `LiquidAI/LFM2.5-1.2B-Instruct` (commit `0f604ad`), publicada por TPN Labs dentro de su banco de pruebas TPN Workbench. No se trata de un modelo entrenado desde cero, sino de una familia de cuantizaciones del modelo instructivo de Liquid AI, con 1.170.340.608 parámetros (~1,2 B) y un repositorio de 2,5 GB que agrupa todos los formatos generados.

El valor diferencial del repositorio no es el modelo en sí, sino la medición sistemática que lo acompaña: cada formato se evalúa contra la referencia BF16 en divergencia KL por token, perplejidad y acuerdo top-1, además de una prueba de instrucciones (ifeval) y una evaluación conversacional de 32 prompts. Esto permite elegir el compromiso entre tamaño y fidelidad con datos, algo poco habitual en cuantizaciones de modelos pequeños.

Es relevante ahora porque los modelos de ~1 B parámetros son candidatos naturales a inferencia local en navegador y escritorio, y este paquete ofrece desde 0,37 GB (IQ2_XXS) hasta 1,25 GB (Q8_0) con métricas de degradación explícitas. La recomendación del autor es Q6_K (0,96 GB, KLD 0,0069, top-1 95,9 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de LiquidAI/LFM2.5-1.2B-Instruct; la informacion proporcionada no detalla la arquitectura) |
| Parametros totales | 1.170.340.608 (~1,2 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_0, Q5_0+, Q4_K_M, Q4_0, Q4_0+, Q4_0M+, IQ4_XS, Q3_K_M, Q2_K, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS |
| Idiomas soportados | no disponible oficialmente; la evaluacion del autor incluye prompts en aleman, espanol y frances |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`, etiquetada como `other`), heredada del modelo base |
| Formato de pesos | GGUF (libreria `gguf`, ejecutable con llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base: no se especifica si emplea transformer puro, mezcla de expertos, convoluciones o un esquema hibrido, ni se detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo etapas de RLHF o DPO. Lo unico confirmado es que se trata de un modelo instructivo-conversacional (`pipeline_tag: text-generation`, tag `conversational`), con 1.170.340.608 parametros y una variante base en BF16 que el autor usa como referencia para medir las cuantizaciones.

La innovacion tecnica documentada esta en el proceso de cuantizacion, no en el modelo: TPN Workbench genera cada formato y lo puntua contra la referencia BF16 con tres metricas (divergencia KL media por token, delta de perplejidad y acuerdo top-1), y ademas aporta una tabla de bits por peso (bpw). El autor senala que los K-quants disponen de kernels SIMD en el WebAssembly de llama.cpp y de kernels ARM reempaquetados en telefonos, por lo que resultan mas rapidos en esos entornos que los quants I-quant de tamano comparable. El repositorio incluye la etiqueta `imatrix`, lo que indica uso de matrices de importancia en la generacion de los formatos IQ.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte declarado para `llama-server` y ejecucion local en navegador y aplicacion de escritorio mediante Gratis.
- Seguimiento de instrucciones con restricciones de formato: la prueba ifeval arroja 85,6 en Q6_K, 84,5 en Q4_K_M y 84,0 en Q5_K_M.
- Cobertura multilingue parcial verificada en la evaluacion del autor, que incluye prompts en aleman, espanol y frances junto a ingles.
- Razonamiento basico y conocimiento general dentro de la evaluacion conversacional de 32 prompts, con puntuacion global de 65,0 (Q6_K), 65,8 (Q5_K_M) y 61,8 (Q4_K_M) sobre 100.
- Modo "thinking" desactivable: la evaluacion se ejecuto con `thinking off`, lo que implica que el modelo base expone algun mecanismo de razonamiento explicito.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible; el pipeline declarado es unicamente `text-generation`.

## Casos de uso

- Asistente conversacional totalmente local en escritorio y navegador: el modelo esta integrado en Gratis y se lanza con `llama-server -hf tpnlabs/LFM2.5-1.2B-Instruct-TPN-GGUF --hf-file LFM2.5-1.2B-Instruct-Q6_K.gguf`, de modo que con menos de 1 GB de pesos se obtiene un asistente sin llamadas a la nube.
- Prototipado y pruebas de regresion de prompts en CI: al ser un GGUF de 0,73-0,96 GB, se puede levantar un servidor compatible con la API de endpoints en un runner modesto y comparar respuestas entre versiones del prompt sin coste de tokens.
- Normalizacion y formateo de texto con instrucciones estrictas: el rendimiento en ifeval (84-85,6) lo hace util para tareas de reescritura con formato fijo, extraccion de campos y conversion a plantillas en pipelines ETL.
- Procesamiento por lotes en CPU para clasificacion y etiquetado de bajo valor anadido: con Q4_K_M (0,73 GB) o IQ4_XS (0,66 GB) cabe en contenedores sin GPU y permite etiquetar grandes volumenes de texto donde no se justifica un modelo mayor.
- Aplicaciones educativas y de demostracion offline: util en entornos sin conectividad o con requisitos de privacidad estrictos, donde el texto no puede salir del dispositivo.
- Generacion de texto creativo corto y borradores: la evaluacion cubre categorias de creatividad, instrucciones, razonamiento, conocimiento y honestidad, con una puntuacion global en torno a 65/100 que acota las expectativas a tareas de asistencia ligera.
- Traduccion y asistencia en espanol, aleman y frances en contextos de baja exigencia, dado que la bateria de evaluacion incluye prompts en esos tres idiomas.
- Seleccion de formato segun el dispositivo: Q6_K o Q5_K_M para moviles con kernels ARM reempaquetados; IQ2/IQ3 para entornos con restricciones severas de memoria, aceptando la perdida de calidad documentada.

## Benchmarks y rendimiento

Fidelidad frente a la referencia BF16 (menor KLD es mejor):

| Formato | Tamano | bpw | KLD media | Delta PPL | Top-1 |
|---|---|---|---|---|---|
| Q8_0 | 1,25 GB | 8,5 | 0,0014 | +0,61 % | 98,0 % |
| Q6_K | 0,96 GB | 6,56 | 0,0069 | +0,25 % | 95,9 % |
| Q5_K_M | 0,84 GB | 5,64 | 0,0185 | +0,06 % | 93,4 % |
| Q5_0 / Q5_0+ | 0,86 GB | 5,5 | 0,0266 | +2,31 % | 92,0 % |
| Q4_K_M | 0,73 GB | 4,77 | 0,0566 | -1,36 % | 88,4 % |
| Q4_0M+ | 0,76 GB | 4,79 | 0,0661 | +1,00 % | 87,7 % |
| IQ4_XS | 0,66 GB | 4,25 | 0,0724 | +2,02 % | 87,1 % |
| Q4_0 / Q4_0+ | 0,73 GB | 4,5 | 0,0940 | +8,18 % | 85,3 % |
| Q3_K_M | 0,60 GB | 3,76 | 0,1582 | +5,37 % | 80,7 % |
| Q2_K | 0,48 GB | 2,86 | 0,5384 | +27,09 % | 66,5 % |
| IQ2_M | 0,43 GB | 2,62 | 0,5624 | +29,30 % | 66,0 % |
| IQ2_S | 0,40 GB | 2,38 | 0,6961 | +46,13 % | 62,2 % |
| IQ2_XS | 0,40 GB | 2,33 | 0,8351 | +75,12 % | 58,3 % |
| IQ2_XXS | 0,37 GB | 2,09 | 1,2455 | +159,03 % | 50,8 % |

Calidad en tareas:

| Formato | ifeval | Gratis chat eval (sobre 100) |
|---|---|---|
| Q6_K | 85,6 | 65,0 |
| Q5_K_M | 84,0 | 65,8 |
| Q4_K_M | 84,5 | 61,8 |

La evaluacion conversacional Gratis emplea 32 prompts cotidianos (creatividad, instrucciones, razonamiento, conocimiento, tareas, aleman/espanol/frances, honestidad y chat), con 3 muestras por prompt, `thinking off`, y calificacion de 1 a 10 por Claude Sonnet; el ruido entre ejecuciones se estima en +-2 puntos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: viable en todos los formatos. Con Q4_K_M (0,73 GB) o Q6_K (0,96 GB) el modelo cabe holgadamente en la memoria de un portatil convencional; el autor destaca kernels ARM reempaquetados para telefonos en los K-quants.
- VRAM estimada (calculo a partir del tamano de los pesos, sin incluir cache KV): aproximadamente 0,4-0,5 GB con IQ2_XXS, 0,75-1,0 GB con Q4_K_M, 1,0-1,3 GB con Q6_K y 1,3-1,6 GB con Q8_0. La memoria para el contexto depende de la longitud de contexto, dato no disponible.
- GPU consumer: cabe en cualquier GPU con 2 GB o mas de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, RX 6600 y superiores). En iGPU y APUs es ejecutable mediante llama.cpp con offload parcial.
- GPU de datacenter: A100, H100, L40S o similares no son necesarias por capacidad; solo tendrian sentido para servir muchas instancias concurrentes en un mismo nodo.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama (importando el GGUF), y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, Jan). El repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con la API de endpoints. vLLM y TGI no estan documentados para este repositorio en la informacion disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de modelos alternativos (parametros, contexto, benchmarks, licencia) en la informacion proporcionada, por lo que la comparacion con modelos de la misma categoria se marca como no disponible. La unica comparacion con datos reales es interna, entre los formatos de cuantizacion de este mismo repositorio:

| Criterio | Q6_K (recomendado) | Q5_K_M | Q4_K_M | Q2_K |
|---|---|---|---|---|
| Tamano | 0,96 GB | 0,84 GB | 0,73 GB | 0,48 GB |
| KLD media | 0,0069 | 0,0185 | 0,0566 | 0,5384 |
| Top-1 | 95,9 % | 93,4 % | 88,4 % | 66,5 % |
| Delta PPL | +0,25 % | +0,06 % | -1,36 % | +27,09 % |
| ifeval | 85,6 | 84,0 | 84,5 | no medido |
| Gratis eval | 65,0 | 65,8 | 61,8 | no medido |

## Limitaciones y advertencias

- Licencia LFM Open License v1.0: la model card no detalla condiciones, umbrales de facturacion ni restricciones de uso comercial. Es imprescindible revisar el fichero `LICENSE` del repositorio antes de un despliegue en produccion.
- Modelo de 1,2 B parametros: la tasa de alucinacion en tareas de conocimiento factual es alta por capacidad, no por la cuantizacion. No es adecuado como fuente de verdad sin verificacion externa.
- Las cuantizaciones de 2 bits destruyen el modelo: IQ2_XXS cae a 50,8 % de acuerdo top-1 y +159 % de perplejidad, e IQ2_XS a 58,3 % y +75 %. Por debajo de Q3_K_M (80,7 % top-1) la calidad es marginal para uso real.
- El delta de perplejidad de Q4_K_M es negativo (-1,36 %), lo que indica que la metrica de PPL no es monotona con la degradacion real; conviene guiarse por KLD y top-1.
- Idiomas no declarados oficialmente: solo hay evidencia empirica de prompts en aleman, espanol y frances dentro de una evaluacion de 32 prompts; el soporte real por idioma no esta cuantificado.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion sobre documentos extensos.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay resultados de benchmarks estandar que permitan situarlo frente a otros modelos de su tamano.
- La evaluacion conversacional esta puntuada por un modelo (Claude Sonnet) con ruido declarado de +-2 puntos, por lo que diferencias de 1-2 puntos entre formatos no son significativas.
- No hay evidencia documentada de soporte de tool calling, agentes o multimodalidad; no debe asumirse en el diseno de una aplicacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tpnlabs/LFM2.5-1.2B-Instruct-TPN-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Informe completo de cuantizacion (TPN Workbench): https://bench.trueperformancenetwork.com/r/DGiXiKCe9ZoZ9uoncS1v2A
- Banco de pruebas TPN Workbench: https://bench.trueperformancenetwork.com
- Aplicacion Gratis (ejecucion on-device): https://gratis.trueperformancenetwork.com/
- Licencia: fichero `LICENSE` dentro del repositorio de HuggingFace

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores son los unicos encontrados en la informacion disponible.
