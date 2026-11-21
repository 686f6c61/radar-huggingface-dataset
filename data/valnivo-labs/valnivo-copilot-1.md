# Valnivo-labs/valnivo-copilot-1

## Resumen

Valnivo Copilot 1.8 es un modelo de lenguaje conversacional de pequeno tamano desarrollado por Valnivo Labs, derivado mediante ajuste fino con LoRA sobre Qwen/Qwen2.5-1.5B-Instruct. Su proposito es ejecutarse integramente en el dispositivo del usuario (on-device), concretamente en el navegador, gracias a su exportacion a ONNX en cuantizacion de 4 bits y su integracion con la libreria transformers.js. El modelo esta pensado para el producto "Ask Valnivo" del propio autor, actuando como copiloto conversacional.

La relevancia de este modelo radica en su enfoque de despliegue: con 1.500 millones de parametros en su base y pesos cuantizados a 4 bits repartidos en diez ficheros de 200 MB o menos, esta disenado para cargarse en entornos web mediante WebGPU sin depender de infraestructura de servidor. Soporta ocho idiomas europeos (ingles, frances, aleman, espanol, italiano, portugues, neerlandes y polaco) y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial.

La model card reporta una evaluacion sobre 773 preguntas no vistas con una tasa de acierto del 95,5 % (738/773), ligeramente superior a la version 1.6 (95,3 %), y destaca que no se filtro ningun "consejo" en la prueba de escritura (128/128). No se detallan, sin embargo, las caracteristicas completas del entrenamiento ni benchmarks estandarizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.500 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4 (ONNX, 4 bits) |
| Idiomas soportados | en, fr, de, es, it, pt, nl, pl |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (transformers.js, formato externo en diez ficheros de 200 MB o menos) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros, y se ajusta mediante LoRA sobre lo que la model card denomina "the advanced set plus round-8b corrections". No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO adicionales mas alla del ajuste supervisado implícito en el proceso de LoRA sobre un modelo ya instruido.

La innovacion tecnica principal no esta en la arquitectura sino en el empaquetado: la exportacion a ONNX en cuantizacion q4 con formato de datos externos (diez ficheros de 200 MB o menos) permite la carga progresiva en navegador mediante transformers.js 4.3 o superior, con `dtype: 'q4'`, `device: 'webgpu'` y `use_external_data_format: 10`. Esta fragmentacion facilita la descarga por partes y la ejecucion en WebGPU sin necesidad de backend.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a un asistente ("Ask Valnivo").
- Razonamiento basico y respuesta a preguntas, heredado de Qwen2.5-1.5B-Instruct.
- Capacidades multilingues en ocho idiomas europeos: ingles, frances, aleman, espanol, italiano, portugues, neerlandes y polaco.
- Ejecucion on-device en navegador mediante WebGPU, sin llamadas a servidor.
- Capacidad de escritura: la model card reporta 128/128 en una prueba de escritura.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Asistente conversacional embebido en web: el modelo puede gestionar dialogos multi-turno directamente en el navegador del usuario mediante WebGPU, eliminando la latencia de red y los costes de inferencia en servidor.
- Chat de soporte en aplicaciones web con requisitos de privacidad: al ejecutarse on-device, los mensajes del usuario no abandonan el dispositivo, lo que resulta adecuado para entornos con datos sensibles.
- Prototipado rapido de copilotos: gracias a transformers.js 4.3+ y la carga por ficheros fragmentados, un desarrollador puede integrar el modelo en una pagina con pocas lineas de JavaScript.
- Aplicaciones multilingues europeas: los ocho idiomas soportados permiten desplegar una misma interfaz de asistente para usuarios de Espana, Francia, Alemania, Italia, Portugal, Paises Bajos y Polonia sin modelos separados.
- Generacion de texto asistida en formularios o editores web: la capacidad de escritura reportada (128/128) sugiere utilidad para redaccion guiada y completado de textos cortos.
- Demos y entornos sin backend: escenarios de educacion, ferias o aplicaciones offline donde no se dispone de infraestructura de inferencia en servidor.
- Filtrado y moderacion ligera en cliente: por su tamano reducido y ejecucion local, puede emplearse para tareas auxiliares de clasificacion o reescritura antes de enviar datos a un servicio mayor.

## Benchmarks y rendimiento

| Evaluacion | Valnivo Copilot 1.8 | Valnivo Copilot 1.6 |
|---|---|---|
| Preguntas no vistas (773) | 738/773 (95,5 %) | 737/773 (95,3 %) |
| Prueba de escritura (128) | 128/128 | no disponible |
| Fugas de consejos ("advice leaked") | 0 | no disponible |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos anteriores proceden de la evaluacion interna del autor y no son directamente comparables con benchmarks publicos.

## Requisitos de hardware

- VRAM estimada para inferencia en q4: no disponible de forma explicita; con 1.500 millones de parametros en 4 bits, el peso de los pesos ronda los 0,8-1 GB, mas overhead de activaciones y contexto.
- GPU recomendadas: no disponibles en la informacion proporcionada; el modelo esta disenado para WebGPU en navegador, por lo que depende de la GPU del cliente.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano y la cuantizacion, aunque no se confirma en la model card.
- Opciones de despliegue: transformers.js 4.3+ con `dtype: 'q4'`, `device: 'webgpu'` y `use_external_data_format: 10`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Idiomas |
|---|---|---|---|---|---|
| Valnivo Copilot 1.8 | 1,5 B (base) | no disponible | Apache-2.0 | ONNX / transformers.js / WebGPU | 8 idiomas europeos |
| Qwen2.5-1.5B-Instruct | 1,5 B | no disponible en la informacion | Apache-2.0 | Multiples (incluye transformers.js) | Multilingue amplio |
| Otros modelos on-device de ~1-2 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que no se dispone de datos de otros modelos on-device comparables en la informacion proporcionada. Valnivo Copilot 1.8 se diferencia de Qwen2.5-1.5B-Instruct por su ajuste LoRA especifico y su empaquetado ONNX q4 optimizado para navegador.

## Limitaciones y advertencias

- La evaluacion reportada (95,5 % en 773 preguntas) es interna del autor y no equivale a benchmarks publicos; no permite comparacion directa con otros modelos.
- No se documentan datos sobre sesgos, alucinacion ni robustez fuera del conjunto de evaluacion del autor.
- La longitud de contexto no se especifica; se desconoce si se mantiene la del modelo base Qwen2.5-1.5B-Instruct.
- El modelo esta especializado en el producto "Ask Valnivo"; su comportamiento fuera de ese dominio conversacional no esta caracterizado.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El despliegue depende de WebGPU y transformers.js 4.3+, lo que excluye navegadores o dispositivos sin soporte.
- El repositorio ocupa 12,9 GB, aunque los ficheros individuales son de 200 MB o menos; la descarga completa puede ser costosa en conexiones lentas.

## Enlaces

- Hugging Face: https://huggingface.co/Valnivo-labs/valnivo-copilot-1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria transformers.js: https://github.com/huggingface/transformers.js
- WebGPU: https://developer.mozilla.org/es/docs/Web/API/WebGPU_API
