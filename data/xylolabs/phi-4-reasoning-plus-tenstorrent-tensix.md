# Xylolabs/Phi-4-reasoning-plus-Tenstorrent-Tensix

## Resumen

Phi-4-reasoning-plus-Tenstorrent-Tensix es una version cuantizada del modelo microsoft/Phi-4-reasoning-plus, preparada por Xylolabs para su ejecucion sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole) mediante el stack tt-metal y la libreria ttnn. El modelo base es un transformer denso de Microsoft orientado a razonamiento explicito, que genera un bloque de pensamiento antes de emitir la respuesta final. Esta distribucion no modifica el modelo conceptualmente: adapta el formato de pesos al esquema de block floating point (BFP) que entienden los tensores Tensix.

La relevancia de esta ficha es practica: permite ejecutar un modelo de razonamiento de la familia Phi-4 sobre hardware NPU no convencional, con un peso empaquetado de 11,03 GB en el directorio `bfp4/`, frente a los 29,3 GB del repositorio completo. La cuantizacion aplica bfloat4_b a las capas MLP y bfloat8_b a la atencion, manteniendo el resto en bf16, con una divergencia medida respecto a BF16 de KL media 0,0212 sobre 14.528 posiciones evaluadas.

El modelo conserva la licencia MIT del original y el idioma declarado es exclusivamente ingles. Es una opcion a considerar cuando se dispone de hardware Tenstorrent y se busca un modelo de razonamiento con modo thinking, tool calling y contexto largo, sin depender de CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Phi-4-reasoning-plus); pesos empaquetados para Tensix en block floating point |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | MLP en bfloat4_b; atencion en bfloat8_b; resto en bf16 (directorio `bfp4/`) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (pesos); herramientas de empaquetado Apache 2.0 |
| Formato de pesos | safetensors con empaquetado BFP para tt-metal/ttnn; indice `model.safetensors.index.json` y metadatos `quant4.json` |

## Arquitectura y entrenamiento

El modelo subyacente es microsoft/Phi-4-reasoning-plus, un transformer denso afinado para razonamiento con generacion de un bloque de pensamiento previo a la respuesta. Esta distribucion no reentrena ni modifica el comportamiento del modelo: toma el checkpoint original y lo cuantiza con la herramienta tensix-bfp-gptq v0.1.0, que aplica block floating point por bloques. La configuracion concreta asigna bfloat4_b a las proyecciones MLP y bfloat8_b a las proyecciones de atencion, dejando el resto de tensores en bf16. El resultado se empaqueta en tensores con layout TILE y memoria DRAM para ttnn, con un script `pack_tensix.py` y un verificador `verify_grid.py` que permite round-trip de valores contra el dispositivo.

La evaluacion de calidad incluida en la model card reporta una KL media de 0,0211821047483 frente a BF16 sobre las 14.528 posiciones puntuadas de una referencia de 16 secuencias en ingles y coreano, en formato crudo y chat. El limite declarado por el autor es 1,5 veces la KL de la referencia Q4_K_M del mismo checkpoint original (0,014722), por lo que la cuantizacion BFP4 se mantiene dentro de ese margen. Ademas se reporta una comprobacion de respuestas de 33/33 + 7/7 con muestreo a temperatura 0,8, frente a 33/33 + 6/7 del BF16 original. No se detallan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF/DPO).

## Capacidades

- Generacion de texto con modo de razonamiento explicito: el modelo escribe un bloque de pensamiento antes de la respuesta final, segun la plantilla de chat original de Microsoft.
- Razonamiento multi-paso y resolucion de problemas, heredado del ajuste de Phi-4-reasoning-plus.
- Generacion de codigo y matematicas, coherente con el perfil del modelo base.
- Soporte de tool calling y function calling a traves de la plantilla de chat original.
- Capacidades de agente y razonamiento encadenado, apoyadas en el bloque de pensamiento.
- Multilingue limitado: el modelo declara unicamente ingles, aunque la evaluacion de KL incluye secuencias en coreano como referencia de calibracion.
- Ejecucion sobre NPU Tenstorrent Wormhole y Blackhole mediante tt-metal y ttnn, con tensores bfloat4_b y bfloat8_b.

## Casos de uso

- Razonamiento asistido en produccion sobre hardware Tenstorrent: el modelo puede desplegarse en NPU Wormhole o Blackhole usando los pesos `bfp4/`, lo que permite incorporar razonamiento explicito en entornos sin GPU NVIDIA.
- Analisis de problemas tecnicos con traza de pensamiento: el bloque de pensamiento previo a la respuesta facilita auditar el razonamiento en tareas de depuracion, diagnostico o revision de codigo.
- Generacion de codigo con verificacion intermedia: el modo thinking permite que el modelo planifique antes de escribir, util en pipelines de CI/CD donde se requiere una justificacion del cambio propuesto.
- Agentes con tool calling: la plantilla de chat original y el soporte de function calling permiten integrar el modelo en flujos de agente que consultan APIs o bases de datos antes de responder.
- Evaluacion comparativa de cuantizacion: el repositorio incluye metricas de KL y comprobaciones de respuestas, lo que lo hace util para estudiar el impacto de BFP4/BFP8 frente a BF16 y Q4_K_M en un mismo checkpoint.
- Despliegue en entornos con restricciones de memoria: el peso empaquetado de 11,03 GB frente a los 29,3 GB del repositorio completo reduce los requisitos de almacenamiento y de memoria del dispositivo.
- Investigacion en aceleradores no CUDA: sirve como banco de pruebas para medir latencia y throughput de un transformer de razonamiento sobre Tensix con el stack ttnn.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Los unicos datos de calidad disponibles son las metricas de divergencia de la cuantizacion:

| Metrica | bfp4/ (BFP4/BFP8) | BF16 original | Q4_K_M del mismo checkpoint |
|---|---|---|---|
| KL media a BF16 (14.528 posiciones) | 0,0211821047483 | 0 | 0,014722 |
| Comprobacion de respuestas (33 + 7) | 33/33 + 7/7 | 33/33 + 6/7 | 33/33 + 7/7 |
| Tamano empaquetado | 11,03 GB | no disponible | no disponible |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NPU Tenstorrent Wormhole y Blackhole, con el stack tt-metal y la libreria ttnn.
- VRAM estimada: no aplica en el sentido tradicional; el modelo se ejecuta en memoria del dispositivo Tensix. El directorio `bfp4/` ocupa 11,03 GB empaquetados.
- GPU recomendadas: no es un modelo pensado para GPU. La quickstart de la model card usa `AutoModelForCausalLM` con `dtype="bfloat16"` y `device_map="auto"`, lo que implica que puede cargarse en GPU para inspeccion o validacion, pero el destino es Tensix.
- Cabe en consumer GPU: no disponible como dato verificado; el peso empaquetado de 11,03 GB supera la VRAM de la mayoria de GPU de consumo en bf16, aunque la carga en GPU solo se documenta como referencia.
- Opciones de despliegue: ttnn sobre tt-metal para Tensix; transformers para carga y validacion en GPU. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / hardware | Notas |
|---|---|---|---|---|---|
| Phi-4-reasoning-plus-Tenstorrent-Tensix (este) | no disponible | no disponible | MIT | safetensors BFP para Tensix | Cuantizado BFP4/BFP8, 11,03 GB empaquetados |
| microsoft/Phi-4-reasoning-plus | no disponible | no disponible | MIT | safetensors BF16 | Modelo base original, sin cuantizar |
| Q4_K_M del mismo checkpoint | no disponible | no disponible | MIT | GGUF (inferido por la nomenclatura) | Referencia de KL 0,014722 citada por el autor |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce divergencia respecto a BF16: KL media de 0,0212 sobre 14.528 posiciones, superior a la de Q4_K_M (0,014722) del mismo checkpoint, aunque dentro del margen declarado por el autor.
- El modelo declara exclusivamente ingles; el rendimiento en castellano no esta verificado y no debe asumirse.
- Riesgo de alucinacion inherente al modelo base, no mitigado por la cuantizacion.
- El bloque de pensamiento incrementa el numero de tokens generados y, por tanto, la latencia y el coste computacional en produccion.
- Dependencia de hardware especifico: los pesos estan empaquetados para Tensix y requieren tt-metal y ttnn; no son directamente utilizables en CUDA sin conversion.
- La licencia MIT se hereda del modelo original; las herramientas de empaquetado (`pack_tensix.py`, `verify_grid.py`) usan Apache 2.0, lo que no altera los terminos MIT de los pesos.
- El repositorio fue renombrado el 2026-11-27 desde `Phi-4-reasoning-plus-Tenstorrent-Tensix-BFP4`; las rutas antiguas pueden fallar.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Phi-4-reasoning-plus-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/microsoft/Phi-4-reasoning-plus
- Codigo de cuantizacion (tensix-bfp-gptq v0.1.0): https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Herramientas de empaquetado: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0/tools
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/Phi-4-reasoning-plus-Tenstorrent-Tensix/blob/main/LICENSE
