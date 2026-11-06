# TouradAi/qwen3-4b-instruct-african-toolcalling

## Resumen

TouradAi/qwen3-4b-instruct-african-toolcalling es un ajuste fino (fine-tune) del modelo Qwen3-4B-Instruct-2507 de Alibaba, publicado por el usuario TouradAi. Se trata de un modelo de generacion de texto de aproximadamente 4.022 millones de parametros, orientado especificamente al uso de herramientas (tool calling / function calling) en contextos linguisticos africanos, aunque la unica lengua declarada en la model card es el ingles.

El modelo parte de la arquitectura Qwen3, un transformer decoder-only denso (no MoE en esta variante de 4B), y ha sido entrenado con la libreria Unsloth, segun indican los tags del repositorio. Su relevancia radica en la escasez de modelos ajustados para tool calling en el ambito africano, un nicho poco cubierto por los grandes laboratorios. El acceso al repositorio esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo.

La informacion publicada por el autor es muy limitada: no se detallan volumenes de datos de entrenamiento, composicion del dataset, resultados de benchmarks ni hiperparametros del ajuste. Esta ficha recoge exclusivamente los datos disponibles en Hugging Face y en la informacion del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, densa) |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-4B-Instruct-2507 soporta contexto largo, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint unsloth/Qwen3-4B-Instruct-2507, que a su vez deriva de la familia Qwen3 de Alibaba. La arquitectura es un transformer decoder-only denso con aproximadamente 4.022 millones de parametros. No se dispone de informacion publica sobre la composicion exacta del dataset de ajuste, el numero de tokens utilizados, ni si se emplearon tecnicas de RLHF, DPO o SFT supervisado. Los tags indican el uso de la herramienta Unsloth, lo que sugiere un ajuste eficiente en memoria (LoRA/QLoRA o similar), aunque el autor no lo confirma explicitamente.

La innovacion declarada es el enfoque en tool calling para contextos africanos, si bien no se especifica que idiomas africanos concretos cubre ni como se construyo el dataset de herramientas. Tampoco se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional en ingles.
- Tool calling / function calling: capacidad principal del ajuste, orientada a invocar herramientas externas.
- Integracion con text-generation-inference y endpoints compatibles (segun tags).
- Razonamiento multi-paso basado en el modelo base Qwen3-4B-Instruct-2507.
- Capacidades multilingues limitadas al ingles segun la model card (a pesar del nombre "african").
- No se documentan capacidades de vision, audio ni modos de pensamiento explicito.

## Casos de uso

- Asistentes conversacionales con invocacion de APIs: el modelo puede decidir cuando llamar a una funcion externa (clima, calendario, busquedas) en flujos de atencion al cliente en ingles.
- Automatizacion de tareas en pipelines de agentes: integracion en frameworks de agentes que requieran function calling estructurado con un modelo ligero de 4B.
- Prototipado rapido en entornos con recursos limitados: su tamano permite desplegarlo en una sola GPU consumer para pruebas de concepto de tool calling.
- Investigacion sobre adaptacion linguistica africana: punto de partida para estudiar como se comporta un modelo ajustado en tool calling cuando el dataset declara foco africano pero solo lista ingles.
- Backend de chatbots para servicios financieros o administrativos en ingles: el modelo puede enrutar consultas a herramientas de consulta de saldo, estado de tramites, etc.
- Evaluacion comparativa de fine-tunes de Qwen3-4B: util como referencia para medir el impacto de ajustes especificos en tool calling frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~8 GB solo para pesos, mas overhead de activaciones y KV cache (10-12 GB en la practica).
- VRAM estimada en cuantizacion 8-bit: ~4-5 GB; en 4-bit: ~2,5-3 GB.
- GPU recomendadas: NVIDIA A100, H100, L40S para produccion; RTX 4090, RTX 3090, RTX 4080 para desarrollo.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares con cuantizacion o FP16.
- Opciones de despliegue: transformers, text-generation-inference (segun tags), vLLM, llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TouradAi/qwen3-4b-instruct-african-toolcalling | ~4,02 B | No disponible | Si (objetivo del ajuste) | Apache 2.0 | Gated en HF |
| unsloth/Qwen3-4B-Instruct-2507 (base) | ~4,02 B | No disponible en esta ficha | Si (soporte nativo Qwen3) | Apache 2.0 | Publico en HF |
| Qwen3-4B-Instruct-2507 (original Alibaba) | ~4,02 B | No disponible en esta ficha | Si | Apache 2.0 | Publico en HF |

La comparativa con alternativas de otros fabricantes (Llama 3.2 3B, Phi-4-mini, Gemma 3 4B) no se incluye por falta de datos verificables en la informacion proporcionada sobre rendimiento relativo.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatizacion de descargas en CI/CD.
- Documentacion muy escasa: no se detallan datos de entrenamiento, benchmarks ni limitaciones declaradas por el autor.
- El nombre sugiere cobertura de idiomas africanos, pero la model card solo declara ingles; posible discrepancia entre nombre y capacidades reales.
- Riesgo de alucinacion inherente a modelos de 4B, especialmente en tool calling con esquemas complejos.
- No se han publicado pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto sin conversion manual.
- Sin datos de evaluacion de sesgos; se desconoce el comportamiento en dominios sensibles.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks impide garantizar calidad en produccion.
- El ajuste puede haber degradado capacidades generales del modelo base al especializarse en tool calling.

## Enlaces

- Hugging Face: https://huggingface.co/TouradAi/qwen3-4b-instruct-african-toolcalling
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
