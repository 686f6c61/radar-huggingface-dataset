# tomo-o/elyza-thinking-1.0-llm-jp-4-33b-p300x2

## Resumen

`tomo-o/elyza-thinking-1.0-llm-jp-4-33b-p300x2` es un bundle comunitario no oficial que empaqueta los pesos de `elyza/ELYZA-Thinking-1.0-llm-jp-4-33b` para su despliegue sobre hardware Tenstorrent. El modelo subyacente es un transformer denso decoder-only de 33 000 millones de parametros, de estilo Llama, con 64 capas y un vocabulario de 196 608 tokens, post-entrenado por ELYZA, Inc. sobre la base `llm-jp/llm-jp-4-33b-base` como modelo de razonamiento. El bundle lo publica el usuario tomo-o y no esta afiliado ni respaldado por ELYZA.

El paquete no contiene los pesos en el repositorio (1,9 GB corresponde a la imagen de contenedor y metadatos): el proceso de `pull` descarga los pesos originales desde el Hub de Hugging Face en la revision `6ca556b2ddc4642580752b3a1ae2d7e7681106fc`. Se sirve mediante vLLM 0.26.0 con el plugin de vLLM de Tenstorrent sobre un QuietBox 2 (dos placas p300c, cuatro chips Blackhole, malla P300x2), con una ventana de contexto de 65 536 tokens y hasta 32 secuencias concurrentes.

Su relevancia es doble: por un lado, expone un modelo de razonamiento en japones e ingles con separacion explicita entre traza de pensamiento y respuesta final, y con soporte de tool calling; por otro, demuestra un camino de despliegue en aceleradores Tenstorrent con una API compatible con OpenAI, lo que permite evaluar la viabilidad de alternativas a GPU en cargas de inferencia de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only estilo Llama, 64 capas |
| Parametros totales | 33 000 millones (33B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 65 536 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones e ingles (segun uso previsto declarado) |
| Licencia | apache-2.0 |
| Formato de pesos | pesos originales de Hugging Face descargados en tiempo de `pull`; el bundle empaqueta imagen de contenedor y metadatos, no safetensors ni GGUF |

Otros datos del bundle: vocabulario de 196 608 tokens, pipeline `text-generation`, servidor OpenAI-compatible en el puerto 20000, empaquetado con `tt-model-manager` 0.1.0 (esquema de manifiesto 5.1), estado declarado como "experimental community bring-up".

## Arquitectura y entrenamiento

La arquitectura es un transformer denso decoder-only de 33B parametros con 64 capas y un vocabulario muy amplio (196 608 entradas), siguiendo el patron Llama. El modelo base es `llm-jp/llm-jp-4-33b-base`, sobre el que ELYZA aplico un post-entrenamiento orientado a razonamiento (ELYZA-Thinking 1.0). No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF, DPO o RL con verificadores.

La innovacion practica del bundle reside en la capa de servicio: vLLM con el plugin de Tenstorrent sobre malla P300x2, con dos parsers especificos. El parser de razonamiento (`vllm_plugins/llmjp4_reasoning_parser.py`, con dos modificaciones de tomo-o en la ruta de streaming) separa la traza de pensamiento de la respuesta final, y el parser de herramientas (`vllm_plugins/llmjp_harmony_tool_parser.py`, sin modificar) convierte las llamadas a funciones en `tool_calls` con `finish_reason: tool_calls`. El formato de plantilla de chat y el esquema de herramientas siguen el estilo Harmony.

## Capacidades

- Generacion de texto y razonamiento multi-paso en japones e ingles, con traza de pensamiento separada de la respuesta final.
- Modo de razonamiento explicito: la salida de pensamiento se devuelve en el campo `reasoning` (segun la model card, aunque el texto generado menciona `reasoning_content`; en este bundle con vLLM 0.26.0 el campo es `reasoning`).
- Tool calling / function calling: las peticiones con `tools` devuelven `tool_calls` y `finish_reason: tool_calls`.
- Servicio concurrente: hasta 32 secuencias simultaneas con contexto de 65 536 tokens.
- API compatible con OpenAI: `chat/completions`, `completions` y `/v1/models`.
- No soporta llamadas a herramientas en paralelo (explicitamente fuera de alcance).
- No soporta entrada multimodal (explicitamente fuera de alcance).
- No se documentan capacidades de codigo, matematicas o vision mas alla del uso generico de chat y razonamiento.

## Casos de uso

- Asistencia conversacional en japones: el modelo gestiona dialogos multi-turno con hasta 65 536 tokens de contexto, adecuado para soporte al cliente en ese idioma donde se requiere mantener historial extenso y coherencia.
- Razonamiento con traza auditable: al separar `reasoning` de `content`, permite registrar y revisar el proceso de pensamiento en aplicaciones de analisis o cumplimiento normativo sin exponerlo al usuario final.
- Agentes con herramientas en un solo paso: la integracion de `tool_calls` permite conectar el modelo a APIs externas (busqueda, calculo, consulta de bases de datos) en flujos de agente donde no se requieren llamadas paralelas.
- Evaluacion de hardware alternativo: sirve como banco de pruebas para medir latencia y throughput de un modelo de razonamiento de 33B sobre aceleradores Tenstorrent frente a GPU, con cifras de referencia ya publicadas en la model card.
- Despliegue en local o en el borde: un QuietBox 2 con cuatro chips Blackhole puede servir el modelo con API OpenAI-compatible, util para entornos con requisitos de soberania de datos o sin acceso a GPU de datacenter.
- Procesamiento por lotes de documentos largos en japones: la ventana de 65 536 tokens permite resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada.
- Prototipado de asistentes bilingues japones-ingles: el uso previsto declarado cubre ambos idiomas, lo que facilita construir interfaces de traduccion o atencion mixta sin cambiar de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente aporta metricas de rendimiento de servicio medidas sobre este bundle en un QuietBox 2 (dos placas p300c, cuatro chips, malla (1,4); host AMD Ryzen 7 9700X, TT-KMD 2.7.0, firmware 19.8.0), con el cliente en la misma maquina:

| Metrica | Valor declarado |
|---|---|
| Decodificacion a temperatura 0, 1 a 32 usuarios | 17,8-20,7 tokens/s por usuario (prompts de hasta 1024 tokens) |
| Decodificacion con muestreo recomendado (temp. 0,6 / top_p 0,95) | 17,4 tokens/s con 1 usuario; 5,3 tokens/s con 32 usuarios |
| Penalizacion de latencia por token con temperatura > 0 | 1,17x con 1 usuario y 3,63x con 32 usuarios frente a temperatura 0 |
| Contexto maximo | 65 536 tokens |
| Secuencias concurrentes maximas | 32 |
| Metodologia de medida | `bench_aiohttp.py`, streaming, `ignore_eos`, temperatura 0, 2 peticiones de calentamiento, N = max(30, 3x usuarios), bucle cerrado |

La tabla de latencia detallada por ISL/OSL/usuarios aparece truncada en la informacion proporcionada, por lo que no se reproducen el resto de filas.

## Requisitos de hardware

- Hardware objetivo: QuietBox 2 con dos placas p300c y cuatro chips Blackhole en malla P300x2; no es un bundle para GPU convencional.
- VRAM estimada: no disponible; el modelo se ejecuta sobre memoria de los aceleradores Tenstorrent, no sobre VRAM de GPU.
- GPU recomendadas: no aplica a este bundle. Para los pesos originales de `elyza/ELYZA-Thinking-1.0-llm-jp-4-33b` en GPU no se proporcionan requisitos en la informacion disponible.
- Compatibilidad con GPU de consumo: no disponible para este bundle; no se indica soporte en RTX 4090 u otras.
- Opciones de despliegue: `tt` CLI (`tt model pull`, `tt serve`) o `tt-model` (`tt-model pull --with-weights`, `tt-model serve`); servidor OpenAI-compatible en el puerto 20000. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Tiempo de arranque: la primera ejecucion compila kernels para el dispositivo y tarda varios minutos; el servidor esta listo al registrar `Application startup complete`.
- Latencia y throughput: ver tabla de benchmarks; a temperatura 0 el rendimiento por usuario se mantiene estable entre 1 y 32 usuarios, mientras que con muestreo cae de 17,4 a 5,3 tokens/s.
- Existe una variante mas rapida del mismo bundle, `tomo-o/elyza-thinking-1.0-llm-jp-4-33b-p300x2-fast`, con los mismos pesos y salidas a temperatura 0, entre 1,4 y 1,8 veces mas rapida en decodificacion a temperatura 0 y hasta 6,7 veces con el muestreo recomendado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware / despliegue | Notas |
|---|---|---|---|---|---|
| tomo-o/elyza-thinking-1.0-llm-jp-4-33b-p300x2 | 33B denso | 65 536 | apache-2.0 | Tenstorrent p300x2, vLLM + plugin TT | Bundle comunitario no oficial, experimental |
| elyza/ELYZA-Thinking-1.0-llm-jp-4-33b | 33B denso | no disponible en la informacion | apache-2.0 | Pesos originales en Hugging Face; despliegue no especificado | Modelo base del bundle; post-entrenado por ELYZA para razonamiento |
| tomo-o/elyza-thinking-1.0-llm-jp-4-33b-p300x2-fast | 33B denso | 65 536 | apache-2.0 | Tenstorrent p300x2 | Misma salida a temperatura 0, decodificacion 1,4-1,8x mas rapida (hasta 6,7x con muestreo) |

No se dispone de datos de benchmarks de calidad para comparar con modelos de la misma categoria (por ejemplo, otros modelos de razonamiento de 30-35B); la comparativa se limita a parametros, contexto, licencia y opciones de despliegue.

## Limitaciones y advertencias

- Bundle no oficial: no esta afiliado ni respaldado por ELYZA, Inc.; Tenstorrent no lo ha verificado y `tt serve` solicita confirmacion explicita antes de servirlo.
- Estado experimental: la propia model card lo etiqueta como "experimental community bring-up", no como producto listo para produccion.
- Sin llamadas a herramientas en paralelo: el uso concurrente de multiples tools queda fuera de alcance.
- Sin soporte multimodal: no acepta imagenes ni audio.
- Idiomas limitados a japones e ingles segun el uso previsto; no se documenta cobertura adicional.
- Inconsistencia en la documentacion del campo de razonamiento: la model card indica `reasoning_content` en un punto y `reasoning` en otro; con vLLM 0.26.0 el campo efectivo es `reasoning`.
- Reproducibilidad a temperatura 0: la propia documentacion advierte que la respuesta puede cambiar tras reiniciar el servidor.
- Penalizacion de rendimiento con muestreo: usar temperatura > 0 multiplica la latencia por token (hasta 3,63x con 32 usuarios).
- Dependencia de hardware especifico: requiere QuietBox 2 con chips Blackhole; no es portable a GPU sin usar los pesos originales y otro stack.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinacion en la informacion disponible.
- Licencia apache-2.0 en el bundle y en el modelo base, lo que permite uso comercial, pero sin garantias por parte de los autores originales ni del empaquetador.

## Enlaces

- Bundle en Hugging Face: https://huggingface.co/tomo-o/elyza-thinking-1.0-llm-jp-4-33b-p300x2
- Variante rapida del bundle: https://huggingface.co/tomo-o/elyza-thinking-1.0-llm-jp-4-33b-p300x2-fast
- Modelo base original: https://huggingface.co/elyza/ELYZA-Thinking-1.0-llm-jp-4-33b
- Repositorio tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Revision de pesos referenciada: `6ca556b2ddc4642580752b3a1ae2d7e7681106fc`
