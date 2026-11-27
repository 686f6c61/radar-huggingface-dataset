# Xylolabs/Phi-4-reasoning-Tenstorrent-Tensix

## Resumen

Phi-4-reasoning-Tenstorrent-Tensix es una version cuantizada del modelo microsoft/Phi-4-reasoning, adaptada por Xylolabs para ejecutarse sobre aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer denso de Microsoft orientado a razonamiento explicito, con un bloque de pensamiento (thinking block) previo a la respuesta. Esta publicacion no entrena un modelo nuevo: toma los pesos originales en BF16 y los recomprime en formatos de bloque de coma flotante (bfloat4_b y bfloat8_b) compatibles con las NPU de Tenstorrent mediante la libreria ttnn y el stack tt-metal / tt-forge.

La relevancia de esta ficha es practica: permite desplegar un modelo de razonamiento de Microsoft en hardware alternativo a GPU, con un peso empaquetado de 11,034 GB frente a los 29,32 GB del BF16 original, manteniendo una divergencia medida de 0,015808 de KL medio respecto al BF16. Es una ficha de interes para equipos que evaluan inferencia en silicio no-NVIDIA y necesitan saber que se gana, que se pierde y con que limitaciones se topan.

El repositorio tiene 137 descargas y 0 likes en el momento de la consulta, con licencia MIT heredada del modelo base. La informacion disponible es la model card del autor, que documenta el proceso de cuantizacion y el procedimiento de ejecucion, pero no incluye resultados de benchmarks de calidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base microsoft/Phi-4-reasoning); pesos reempaquetados para Tensix |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bfloat4_b (MLP) y bfloat8_b (atencion), resto en bf16; carpeta `bfp4/` |
| Idiomas soportados | en (segun la model card y los tags del repositorio) |
| Licencia | MIT (pesos); scripts `pack_tensix.py` y `verify_grid.py` bajo Apache-2.0 |
| Formato de pesos | safetensors con cuantizacion de bloque BFP4/BFP8; indice `model.safetensors.index.json` y metadatos `quant4.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de Microsoft especializado en razonamiento, que genera un bloque de pensamiento antes de la respuesta final. Esta publicacion no modifica la arquitectura ni reentrena: aplica cuantizacion post-entrenamiento de tipo block floating point sobre los pesos BF16 de microsoft/Phi-4-reasoning. La receta concreta asigna bfloat4_b a las capas MLP y bfloat8_b a las capas de atencion, dejando el resto de tensores en bf16. El formato bfloat4_b y bfloat8_b es nativo de las NPU Tensix y se materializa a traves de ttnn con layout TILE_LAYOUT y memoria DRAM.

La validacion de la cuantizacion se hace por divergencia KL: se comparan 14.528 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con la plantilla de chat de Microsoft sin bloque de pensamiento. El KL medio frente a BF16 es de 0,015808, con un limite fijado en 1,5 veces la referencia Q4_K_M de llama.cpp, que obtiene 0,011492. El peso empaquetado es de 11,034 GB frente a 9,059 GB de Q4_K_M y 29,32 GB en BF16. No se documentan datos de entrenamiento, tokens vistos ni fases de RLHF/DPO, porque el modelo no se entrena en esta publicacion.

La innovacion tecnica destacable es el propio pipeline de empaquetado: los scripts `pack_tensix.py` y `verify_grid.py` (tensix-bfp-gptq v0.1.0, Apache-2.0) permiten empaquetar una matriz y verificar el round-trip contra el tensor original en torch, con opcion `--device` para comprobar los valores empaquetados en la NPU.

## Capacidades

- Generacion de texto con razonamiento explicito: el modelo escribe un bloque de pensamiento antes de la respuesta, segun la plantilla de chat original de Microsoft.
- Razonamiento multi-paso: el formato de thinking block esta pensado para tareas que requieren descomposicion y verificacion intermedia.
- Generacion de codigo y matematicas: capacidades heredadas del modelo base Phi-4-reasoning; no se detallan en la model card de esta cuantizacion.
- Soporte de tool calling: no documentado en la informacion proporcionada para esta version cuantizada.
- Soporte de agentes: no documentado en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun la model card y los tags; la evaluacion KL incluye texto en coreano, pero el idioma declarado es solo `en`.
- Capacidades especiales: thinking mode; no se declaran vision ni audio.

## Casos de uso

- Evaluacion de hardware Tensix en laboratorio: cargar la carpeta `bfp4/` con ttnn en una Wormhole o Blackhole y medir latencia y throughput reales frente a una GPU, usando el round-trip de `verify_grid.py` para validar la integridad de los pesos empaquetados antes de las pruebas.
- Despliegue de razonamiento en entornos con restricciones de suministro de GPU: al ser un formato nativo de Tensix, permite ejecutar un modelo de razonamiento de Microsoft sin depender de CUDA, con un peso de 11,034 GB que reduce los requisitos de memoria DRAM frente a los 29,32 GB del BF16.
- Prototipado de pipelines de cuantizacion BFP4: el repositorio sirve como referencia para equipos que quieran aplicar la misma receta (MLP en bfloat4_b, atencion en bfloat8_b) a otros modelos, reutilizando `pack_tensix.py` y `verify_grid.py`.
- Generacion de codigo asistida en ingles: usar la plantilla de chat original con `max_new_tokens=4096`, temperatura 0,8, top_k 50 y top_p 0,95, tal como recomienda Microsoft, para tareas de sintesis y explicacion de codigo en ingles.
- Analisis de textos largos en ingles con razonamiento intermedio: el bloque de pensamiento permite trazar el razonamiento del modelo en tareas de resumen o respuesta a preguntas, util para auditoria de respuestas.
- Investigacion sobre degradacion por cuantizacion: comparar la salida del modelo en `bfp4/` con la del BF16 original sobre el mismo conjunto de 14.528 posiciones para estudiar el impacto del BFP4 en la calidad del razonamiento, no solo en la perplejidad.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros). El unico dato de rendimiento disponible es la divergencia KL frente al BF16:

| Metrica | bfp4/ (esta publicacion) | Q4_K_M (llama.cpp) | BF16 (original) |
|---|---|---|---|
| Tamano empaquetado (GB) | 11,034 | 9,059 | 29,32 |
| KL medio vs BF16 | 0,015808 | 0,011492 | 0 |

La evaluacion KL cubre 14.528 posiciones de ingles y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con la plantilla de chat de Microsoft sin bloque de pensamiento. No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: el peso empaquetado ocupa 11,034 GB; el modelo se carga con `dtype="bfloat16"` y `device_map="auto"`, por lo que en GPU convencional el consumo en memoria es mayor que el del archivo empaquetado.
- GPU recomendadas: no se especifican en la model card; el destino principal son NPU Tensix de Tenstorrent (Wormhole, Blackhole) mediante ttnn.
- Compatibilidad con GPU de consumo: no documentada. El quickstart usa `device_map="auto"` y el modelo base en BF16 ocupa 29,32 GB, lo que excede la memoria de la mayoria de GPU de consumo en ese formato.
- Opciones de despliegue: ttnn sobre tt-metal / tt-forge para Tensix; transformers con `AutoModelForCausalLM` para el quickstart en GPU; llama.cpp aparece solo como referencia de cuantizacion (Q4_K_M), no como via de despliegue de estos pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-4-reasoning-Tenstorrent-Tensix (esta ficha) | no disponible | no disponible | BFP4/BFP8 para Tensix | MIT | Hugging Face, 137 descargas |
| microsoft/Phi-4-reasoning (BF16) | no disponible | no disponible | BF16 | MIT | Hugging Face (modelo base) |
| Phi-4-reasoning en Q4_K_M (llama.cpp) | no disponible | no disponible | Q4_K_M, 9,059 GB | MIT (heredada) | Referencia de cuantizacion en la model card |

No se dispone de datos de benchmarks para comparar calidad entre estas variantes; la unica comparacion publicada es la divergencia KL frente a BF16. No se han identificado en la informacion proporcionada otras alternativas de la misma categoria con las que comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- La cuantizacion introduce degradacion medible: KL medio de 0,015808 frente a BF16, superior al 0,011492 de Q4_K_M, aunque dentro del limite de 1,5 veces la referencia fijado por el autor.
- La evaluacion KL se hizo con la plantilla de chat sin bloque de pensamiento; el comportamiento con thinking block activo no esta cubierto por esa metrica.
- Idioma declarado: solo ingles. La presencia de coreano en el conjunto de evaluacion no implica soporte oficial de ese idioma.
- No hay benchmarks de calidad publicados para esta version cuantizada; el rendimiento en tareas de razonamiento, codigo o matematicas no esta verificado en la informacion disponible.
- Riesgo de alucinacion: inherente al modelo base; no se documentan mitigaciones adicionales en esta publicacion.
- Sesgos conocidos: no documentados en la model card.
- Licencia MIT en los pesos, heredada del modelo base; los scripts `pack_tensix.py` y `verify_grid.py` estan bajo Apache-2.0 y esa licencia de codigo no sustituye la de los pesos. Cada carpeta lleva su propio `LICENSE` y `NOTICE`.
- Dependencia fuerte del stack Tenstorrent: los pesos estan pensados para ttnn y Tensix; su uso fuera de ese hardware requiere validacion propia.
- El repositorio se renombro el 2026-11-27 desde `Phi-4-reasoning-Tenstorrent-Tensix-BFP4`; enlaces antiguos pueden fallar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Phi-4-reasoning-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/microsoft/Phi-4-reasoning
- Repositorio de codigo tensix-bfp-gptq (v0.1.0): https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Herramientas de empaquetado: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0/tools
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Assets de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq/main/assets/xylolabs-lockup.svg
