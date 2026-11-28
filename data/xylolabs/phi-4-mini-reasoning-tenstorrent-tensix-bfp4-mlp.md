# Xylolabs/Phi-4-mini-reasoning-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Phi-4-mini-reasoning-Tenstorrent-Tensix-BFP4-MLP es una cuantizacion del modelo microsoft/Phi-4-mini-reasoning realizada por Xylolabs, orientada especificamente a la ejecucion sobre aceleradores NPU de Tenstorrent con arquitectura Tensix (Wormhole y Blackhole). No se trata de un modelo nuevo, sino de una distribucion de pesos optimizada para hardware que no es GPU convencional, lo que permite desplegar un modelo de razonamiento de 4,45 mil millones de parametros en plataformas de inferencia de bajo consumo.

El modelo base es Phi-4-mini-reasoning de Microsoft, un transformer denso de la familia Phi-4 con enfasis en tareas de razonamiento de cadena de pensamiento. La cuantizacion aplicada combina bfloat4_b en las capas MLP con bfloat8_b en la atencion y bf16 en el resto de componentes, un esquema de block floating point propio del ecosistema Tensix.

La relevancia de esta ficha radica en que documenta un caso concreto de portabilidad de modelos a hardware alternativo: el paquete ocupa 3,444 GB empaquetado frente a los 7,67 GB del BF16 original, con una divergencia KL media de 1,162884 respecto a BF16, ligeramente superior a la de una cuantizacion Q4_K_M de llama.cpp (1,147011). Es material de interes para quienes evaluan Tenstorrent como alternativa a GPU en inferencia de modelos pequenos de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: microsoft/Phi-4-mini-reasoning) |
| Parametros totales | 4.450.618.368 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (MLP bfloat4_b, atencion bfloat8_b, resto bf16); referencia Q4_K_M y BF16 |
| Idiomas soportados | en (segun metadatos); la evaluacion KL incluye texto en ingles y coreano |
| Licencia | MIT |
| Formato de pesos | safetensors (carpeta bfp4/), esquema block floating point bfloat4_b/bfloat8_b |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Phi-4-mini-reasoning de Microsoft: un transformer denso de aproximadamente 4,45 mil millones de parametros, disenado para razonamiento explicito con cadenas de pensamiento. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF/DPO) empleadas en el modelo base.

La innovacion tecnica de esta distribucion es el esquema de cuantizacion block floating point para Tensix: las matrices de las capas MLP se almacenan en bfloat4_b y las de atencion en bfloat8_b, mientras el resto de pesos permanece en bf16. El repositorio incluye scripts `pack_tensix.py` y `verify_grid.py` (Apache-2.0, de Xylolabs) para empaquetar matrices y verificar la ida y vuelta de valores en dispositivo, ademas de ficheros de metadatos `quant4.json` e indice de safetensors que mapean cada tensor a su formato y shard.

## Capacidades

- Generacion de texto y razonamiento: el modelo base esta orientado a tareas de razonamiento paso a paso, incluyendo matematicas y logica.
- Generacion de codigo: capacidad heredada del modelo base Phi-4-mini-reasoning.
- Conversacion multi-turno mediante plantilla de chat (`apply_chat_template`).
- Inferencia en hardware Tenstorrent Tensix (Wormhole, Blackhole) mediante ttnn y tt-metal.
- Compatibilidad con transformers para carga y ejecucion en GPU/CPU convencional usando los pesos cuantizados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada (el modelo base esta disenado para razonamiento, pero no se detalla soporte de agentes).
- Capacidades multilingues: los metadatos declaran solo ingles; la evaluacion KL incluye coreano, pero no se documenta soporte funcional de ese idioma.
- Vision y audio: no disponibles.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: cargar los pesos de `bfp4/` en una NPU Wormhole o Blackhole mediante ttnn para servir un modelo de razonamiento de 4,45B con un paquete de 3,444 GB, reduciendo la huella de memoria frente al BF16 de 7,67 GB.
- Inferencia de razonamiento en entornos con restricciones de memoria: el esquema BFP4 permite ejecutar el modelo en dispositivos con DRAM limitada, manteniendo una divergencia KL de 1,162884 respecto a BF16.
- Evaluacion comparativa de cuantizaciones: usar los ficheros `quant4.json` y los scripts de verificacion para medir el impacto de BFP4 frente a Q4_K_M en tareas de razonamiento.
- Prototipado de pipelines de generacion de codigo: integracion con transformers y plantilla de chat para asistentes de codigo en entornos de desarrollo con hardware Tenstorrent.
- Investigacion en hardware alternativo: banco de pruebas para comparar latencia y fidelidad numerica de Tensix frente a GPU en modelos pequenos de razonamiento.
- Verificacion de integridad de pesos cuantizados: uso de `verify_grid.py` con `--device` para validar el round-trip de valores empaquetados antes de desplegar en produccion.
- Docencia y experimentacion: modelo de 4,45B con licencia MIT que cabe en el repositorio de 8,9 GB y permite experimentar con cuantizacion block floating point sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta metricas de fidelidad de cuantizacion:

| Metrica | bfp4/ | BF16 (base) | Q4_K_M (llama.cpp) |
|---|---|---|---|
| Tamano empaquetado (GB) | 3,444 | 7,67 | 2,486 |
| KL media respecto a BF16 | 1,162884 | 0 | 1,147011 |

La KL se calcula sobre 16.192 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano y con plantilla de chat, con un limite de KL media de 1,5 veces la referencia Q4_K_M.

## Requisitos de hardware

- VRAM/DRAM estimada: 3,444 GB para los pesos empaquetados en BFP4; 7,67 GB para BF16; 2,486 GB para Q4_K_M de referencia.
- Hardware objetivo: NPU Tenstorrent Tensix, familias Wormhole y Blackhole, mediante tt-metal y ttnn.
- GPU convencionales: compatible con transformers (`device_map="auto"`, `dtype="bfloat16"`), por lo que puede ejecutarse en GPU con memoria suficiente para el modelo cargado; no se especifican modelos concretos de GPU en la informacion disponible.
- GPU consumer: no se confirma compatibilidad ni modelos concretos en la informacion proporcionada.
- Opciones de despliegue: ttnn/tt-metal sobre Tensix; transformers para carga estandar; scripts propios `pack_tensix.py` y `verify_grid.py`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| Este modelo (Phi-4-mini-reasoning BFP4 Tensix) | 4,45B | no disponible | BFP4/BFP8/BF16 | 3,444 GB | MIT | Tenstorrent Tensix |
| microsoft/Phi-4-mini-reasoning (BF16) | 4,45B | no disponible | BF16 | 7,67 GB | MIT | GPU/CPU |
| Phi-4-mini-reasoning Q4_K_M (llama.cpp) | 4,45B | no disponible | Q4_K_M | 2,486 GB | MIT | CPU/GPU |

No se dispone de datos de benchmarks de tareas para comparar el rendimiento funcional frente a estas alternativas; la unica comparacion documentada es la divergencia KL respecto a BF16.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: hereda los sesgos, riesgos de alucinacion y limitaciones del Phi-4-mini-reasoning base, que no se detallan en la informacion proporcionada.
- La cuantizacion BFP4 introduce una divergencia medible (KL media 1,162884), ligeramente superior a la de Q4_K_M (1,147011); puede degradar tareas sensibles a precision numerica.
- El soporte de idiomas declarado es unicamente ingles; el coreano aparece solo en la evaluacion KL, no como idioma soportado oficialmente.
- El hardware objetivo son NPUs Tenstorrent Tensix; fuera de ese ecosistema el valor de esta distribucion es limitado y conviene usar el modelo base o una cuantizacion GGUF.
- La longitud de contexto no se especifica en la informacion disponible; conviene consultar la model card del modelo base antes de usarlo en produccion.
- Licencia MIT, lo que permite uso comercial, pero cada carpeta incluye su propio LICENSE y NOTICE que deben revisarse; los scripts `pack_tensix.py` y `verify_grid.py` son Apache-2.0.
- El repositorio se renombro el 2026-11-27 (antes `Phi-4-mini-reasoning-Tenstorrent-Tensix-BFP4`), lo que puede romper rutas o referencias antiguas en pipelines.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Phi-4-mini-reasoning-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-reasoning
- Repositorio de codigo: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Phi-4-mini-reasoning-Tenstorrent-Tensix/blob/main/LICENSE
- Carpeta de pesos bfp4: https://huggingface.co/Xylolabs/Phi-4-mini-reasoning-Tenstorrent-Tensix-BFP4-MLP/tree/main/bfp4
