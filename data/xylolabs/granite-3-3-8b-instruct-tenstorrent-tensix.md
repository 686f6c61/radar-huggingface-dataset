# Xylolabs/granite-3.3-8b-instruct-Tenstorrent-Tensix

## Resumen

Xylolabs/granite-3.3-8b-instruct-Tenstorrent-Tensix es una version cuantizada del modelo ibm-granite/granite-3.3-8b-instruct de IBM, adaptada especificamente para su ejecucion en aceleradores NPU de Tenstorrent (arquitecturas Tensix Wormhole y Blackhole). No se trata de un modelo nuevo entrenado desde cero, sino de una distribucion de pesos optimizada que aplica cuantizacion en bloque de coma flotante (block floating point, BFP8) sobre las capas de atencion y MLP, manteniendo el resto de tensores en bf16. El objetivo es reducir el peso del modelo de 16,34 GB en BF16 a 8,871 GB empaquetados, con una degradacion de calidad medida y acotada.

El modelo base, granite-3.3-8b-instruct, es un transformer decoder-only de 8.000 millones de parametros desarrollado por IBM dentro de su familia Granite 3.3, orientado a generacion de texto, razonamiento, codigo y uso en entornos empresariales con soporte de tool calling. Esta variante de Xylolabs conserva la licencia Apache 2.0 y la arquitectura del original, pero cambia el formato y el flujo de despliegue: los pesos se empaquetan para ttnn (la libreria de Tenstorrent) mediante los scripts `pack_tensix.py` y `verify_grid.py` incluidos en el repositorio.

La relevancia actual de esta ficha radica en que demuestra un caso practico de cuantizacion hardware-aware para aceleradores no convencionales. La model card reporta una divergencia KL media de 0,00262 frente a BF16 sobre 15.840 posiciones de texto en ingles y coreano, un valor muy inferior al de una cuantizacion Q4_K_M de llama.cpp (0,33915) y por debajo del limite de referencia fijado en 1,5 veces el KL de Q4_K_M. Es, por tanto, una opcion interesante para quien despliegue Granite 3.3 8B sobre hardware Tenstorrent y necesite un equilibrio entre huella de memoria y fidelidad al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de granite-3.3-8b-instruct); pesos cuantizados en block floating point para NPU Tensix |
| Parametros totales | 8.000 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base) |
| Tipos de cuantizacion | BFP8 (bfloat8_b) en atencion y MLP; resto en bf16; carpeta `bfp8/` como unico formato publicado |
| Idiomas soportados | no disponible en la informacion proporcionada (la evaluacion KL cubre ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (indexados con `model.safetensors.index.json`), empaquetables para ttnn |

## Arquitectura y entrenamiento

El modelo base granite-3.3-8b-instruct es un transformer decoder-only de 8.000 millones de parametros entrenado por IBM. Esta distribucion de Xylolabs no reentrena el modelo: parte de los pesos publicos de IBM y aplica un proceso de cuantizacion post-entrenamiento basado en block floating point (BFP8), implementado en el repositorio `tensix-bfp-gptq`. La cuantizacion afecta a las proyecciones de atencion y a las capas MLP, mientras que el resto de tensores se mantienen en bf16. El empaquetado se realiza mediante `pack_tensix.py`, que convierte los tensores al formato `ttnn.bfloat8_b` con layout `TILE_LAYOUT` y memoria DRAM del dispositivo, y `verify_grid.py`, que verifica la integridad del round-trip de los valores empaquetados.

La innovacion tecnica principal es la cuantizacion orientada al hardware Tensix de Tenstorrent, que emplea formatos de bloque en lugar de escalas por canal o por grupo. El autor documenta una evaluacion de calidad basada en divergencia KL sobre 15.840 posiciones de WikiText-2 (test) y Wikipedia en coreano, con y sin plantilla de chat, comparando contra BF16 y contra una referencia Q4_K_M de llama.cpp. No se especifican en la informacion disponible detalles sobre el dataset de entrenamiento original, el uso de RLHF/DPO ni innovaciones de decodificacion del modelo base.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`), tal como se muestra en el ejemplo de la model card.
- Razonamiento y respuesta a preguntas en formato instruct (heredado del modelo base granite-3.3-8b-instruct).
- Generacion de codigo y matematicas: capacidades propias del modelo base, no verificadas de forma independiente en esta distribucion.
- Soporte de tool calling / function calling: heredado del modelo base, no documentado explicitamente en la model card de esta variante.
- Capacidades multilingues: el modelo base de IBM es multilingue, pero la model card de esta variante solo documenta evaluacion KL en ingles y coreano.
- Ejecucion sobre NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante ttnn, ademas de inferencia estandar con Transformers en bf16.
- Verificacion de integridad de pesos empaquetados mediante `verify_grid.py`.

## Casos de uso

- Despliegue de Granite 3.3 8B sobre aceleradores Tenstorrent: el caso principal. Se descarga la carpeta `bfp8/`, se empaqueta con `pack_tensix.py` y se ejecuta en Wormhole o Blackhole, reduciendo la huella de 16,34 GB a 8,871 GB empaquetados.
- Sustitucion de inferencia en GPU por NPU en entornos de borde o servidores con hardware Tenstorrent, manteniendo una divergencia KL baja (0,00262) frente a BF16.
- Evaluacion de calidad de cuantizacion: util como referencia para comparar BFP8 frente a Q4_K_M en tareas de generacion de texto en ingles y coreano, usando la metodologia KL documentada.
- Integracion en pipelines de Transformers: el ejemplo de la model card permite cargar el modelo en bf16 con `device_map="auto"` para pruebas rapidas antes de portarlo a ttnn.
- Prototipado de asistentes conversacionales en hardware Tenstorrent: la plantilla de chat y el formato instruct permiten construir dialogos multi-turno, aunque la longitud de contexto debe consultarse en el modelo base.
- Verificacion de integridad en produccion: `verify_grid.py` con `--device` permite comprobar el round-trip de los pesos empaquetados antes de desplegar, reduciendo el riesgo de corrupcion en la conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta metricas de fidelidad de cuantizacion:

| Metrica | BFP8 (`bfp8/`) | BF16 (base) | Q4_K_M (llama.cpp) |
|---|---|---|---|
| Tamano empaquetado (GB) | 8,871 | 16,34 | 4,943 |
| KL media frente a BF16 | 0,00262 | 0 | 0,33915 |
| Cobertura de evaluacion KL | 15.840 posiciones (WikiText-2 test, Wikipedia coreano, con y sin plantilla de chat) | - | - |

## Requisitos de hardware

- VRAM/DRAM: la carpeta `bfp8/` ocupa 8,871 GB empaquetados frente a 16,34 GB en BF16; el modelo completo en BF16 requiere aproximadamente 16 GB de memoria.
- GPU recomendadas para la ruta Transformers: no especificadas en la informacion disponible; el ejemplo usa `device_map="auto"` con dtype bfloat16.
- NPU objetivo: Tenstorrent Tensix, arquitecturas Wormhole y Blackhole, mediante ttnn.
- Compatibilidad con GPU de consumo: no documentada en la informacion proporcionada.
- Opciones de despliegue: Transformers (ruta de ejemplo) y ttnn sobre hardware Tenstorrent; no se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/granite-3.3-8b-instruct-Tenstorrent-Tensix | 8B | no disponible | BFP8 para Tensix + bf16 | Apache 2.0 | Hugging Face, 153 descargas |
| ibm-granite/granite-3.3-8b-instruct (base) | 8B | no disponible | BF16 safetensors | Apache 2.0 | Hugging Face |
| Q4_K_M de granite-3.3-8b-instruct (llama.cpp) | 8B | no disponible | GGUF Q4_K_M (4,943 GB) | Apache 2.0 | ecosistema llama.cpp |

La comparativa se limita al modelo base y a la referencia Q4_K_M citada en la propia model card; no se dispone de datos de rendimiento en tareas para comparar con otras alternativas de 8B.

## Limitaciones y advertencias

- La cuantizacion BFP8 introduce una divergencia KL media de 0,00262 frente a BF16; aunque baja, no es nula y puede afectar a tareas sensibles a la precision.
- La evaluacion de calidad se limita a ingles y coreano sobre WikiText-2 y Wikipedia; no cubre codigo, matematicas ni otros idiomas.
- No se han publicado benchmarks de tareas (MMLU, HumanEval, GSM8K) para esta variante, por lo que el rendimiento real en produccion no esta cuantificado.
- La ruta de ejecucion principal requiere hardware Tenstorrent (Wormhole, Blackhole) y la libreria ttnn; fuera de ese hardware solo se garantiza la carga en bf16 con Transformers.
- Riesgo de alucinacion y sesgos: heredados del modelo base granite-3.3-8b-instruct; no se documentan evaluaciones especificas en esta variante.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el repositorio del modelo base no incluye fichero LICENSE, por lo que el autor incluye el texto estandar y un NOTICE con los cambios.
- El repositorio fue renombrado el 2026-11-27 desde `granite-3.3-8b-instruct-Tenstorrent-Tensix-BFP8`; los enlaces antiguos pueden fallar.
- El tamano del repo (16,7 GB) incluye mas que la carpeta `bfp8/`; conviene descargar solo esa carpeta con `--include "bfp8/*"`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/granite-3.3-8b-instruct-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/ibm-granite/granite-3.3-8b-instruct
- Repositorio de codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia en el repositorio: https://huggingface.co/Xylolabs/granite-3.3-8b-instruct-Tenstorrent-Tensix/blob/main/LICENSE
