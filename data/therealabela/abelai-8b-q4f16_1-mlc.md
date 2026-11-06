# therealabela/abelai-8b-q4f16_1-MLC

## Resumen

AbelAI 8B es un ajuste fino por LoRA del modelo Qwen3-8B de Alibaba, publicado por Abel Achenkunju (usuario `therealabela`) y empaquetado específicamente para su ejecución en navegador mediante MLC-LLM y WebLLM sobre WebGPU. El repositorio no contiene pesos en formato estándar (safetensors o GGUF), sino los artefactos compilados de MLC en cuantización `q4f16_1`, con un tamaño total de 4,6 GB, pensados para cargarse directamente en la librería de modelos de WebLLM.

El modelo se presenta como un asistente de propósito general integrado en la aplicación web https://achenkunju.com/abelai/, y el autor lo describe explícitamente como "a really dumb AI" en la propia model card, una advertencia de humildad sobre sus capacidades reales. El ajuste se realizó con LoRA de rango 16 sobre un conjunto SFT propio del autor (mayoritariamente en inglés), fusionado después en los pesos bf16 originales de Qwen3-8B y convertido con MLC-LLM.

Su relevancia es acotada pero concreta: demuestra el flujo completo de llevar un modelo de 8B parámetros a inferencia local en el navegador sin servidor, con una licencia Apache 2.0 heredada del modelo base. No obstante, la información publicada es muy escasa (sin benchmarks, sin idiomas declarados, sin detalles del dataset de ajuste) y el número de descargas es mínimo, por lo que debe tratarse como un experimento de nicho más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B); artefactos compilados para MLC-LLM/WebGPU |
| Parametros totales | 8B (heredados de Qwen/Qwen3-8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-8B soporta contextos largos, pero el autor no declara el valor efectivo tras la conversion) |
| Tipos de cuantizacion | q4f16_1 (4 bits de pesos, activaciones en float16), unica variante publicada |
| Idiomas soportados | No disponibles oficialmente; el autor indica que los datos de ajuste son mayoritariamente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefactos MLC-LLM (compilados para WebLLM/WebGPU), tamano de repo 4,6 GB (4608 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer decoder-only denso de 8.000 millones de parametros desarrollado por el equipo Qwen de Alibaba. Sobre esa base, el autor aplico un ajuste fino con LoRA de rango 16 sobre un conjunto SFT propio denominado "AbelAI SFT set", cuyos detalles (numero de ejemplos, composicion, tokens totales) no se publican. El adaptador resultante se fusiono en los pesos bf16 originales del modelo base, fijado en la revision `b968826d9c46dd6066d109eabc6255188de91218`.

La innovacion tecnica principal no esta en el entrenamiento sino en el empaquetado: la conversion con MLC-LLM genera artefactos que se ejecutan con la libreria precompilada `Qwen3-8B-q4f16_1_cs1k-webgpu.wasm`, es decir, se reutiliza la libreria WebGPU ya existente para Qwen3-8B de ese tamano, verificando que el layout de tensores coincide. El formato de chat empleado es el modo no-thinking de Qwen3 (`enable_thinking: false`), lo que desactiva la generacion de cadenas de razonamiento largas antes de la respuesta. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional de proposito general, en formato de asistente multi-turno.
- Razonamiento basico y respuesta a instrucciones, con rendimiento mas debil en matematicas multi-paso y en instrucciones largas y detalladas segun el propio autor.
- Ejecucion local en el navegador mediante WebLLM y WebGPU, sin backend ni servidor.
- Modo no-thinking de Qwen3, lo que reduce la latencia al evitar cadenas de razonamiento extensas.
- Capacidades multilingues heredadas de Qwen3, aunque el ajuste fino se realizo mayoritariamente en ingles.
- No soporta tool calling ni function calling de forma declarada.
- No soporta agentes ni razonamiento multi-paso orquestado de forma declarada.
- No tiene vision, audio, navegacion web, lectura de archivos ni ejecucion de codigo, tal como indica explicitamente la model card.

## Casos de uso

- Asistente conversacional embebido en una web: el modelo se carga en el navegador del usuario via WebLLM y atiende la conversacion sin enviar datos a un servidor, lo que resulta adecuado para demos publicas y prototipos de privacidad por diseno.
- Chat de soporte en entornos con conectividad limitada o sin backend: al ejecutarse en el cliente, puede ofrecer respuestas basicas aunque el usuario no tenga acceso a una API externa.
- Experimentacion con inferencia en navegador: sirve como referencia practica para desarrolladores que quieran replicar el pipeline LoRA + MLC-LLM + WebGPU con un modelo de 8B.
- Educacion y demostraciones tecnicas: util para ilustrar como un modelo de 8B cuantizado a 4 bits cabe en un navegador de escritorio con GPU integrada o dedicada.
- Prototipado de asistentes personalizados: el flujo de ajuste LoRA sobre Qwen3-8B y su empaquetado para WebLLM es reutilizable para crear variantes de dominio especifico.
- Generacion de texto offline en aplicaciones web progresivas: al no requerir servidor, puede integrarse en PWA que necesiten funciones de redaccion o resumen sencillas.
- Evaluacion comparativa de cuantizacion q4f16_1: permite medir la perdida de calidad frente al Qwen3-8B original en tareas conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,6 GB para los pesos en q4f16_1, mas overhead de contexto y buffers de WebGPU; en la practica se recomienda disponer de al menos 6-8 GB de memoria de GPU o memoria unificada.
- GPU recomendadas: el modelo esta pensado para WebGPU, por lo que funciona en GPUs de escritorio modernas (NVIDIA RTX serie 30/40, AMD RDNA2/RDNA3, Apple Silicon M1 o superior) y en algunas GPU integradas recientes.
- Cabe en GPU de consumo: si, en la mayoria de GPU de escritorio con soporte WebGPU y al menos 8 GB de memoria; en moviles y equipos de gama baja el rendimiento sera limitado o la carga puede fallar.
- Opciones de despliegue: WebLLM sobre WebGPU es el unico runtime documentado; no se publican pesos GGUF ni safetensors para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| AbelAI 8B (este modelo) | 8B | No disponible | MLC-LLM / WebLLM (q4f16_1) | Apache 2.0 | Ajuste LoRA sobre Qwen3-8B, orientado a navegador, sin benchmarks publicados |
| Qwen/Qwen3-8B | 8B | No disponible en esta ficha | Safetensors, GGUF, multiples runtimes | Apache 2.0 | Modelo base oficial, con benchmarks publicados por el equipo Qwen |
| Llama 3.1 8B Instruct | 8B | 128K (segun documentacion de Meta) | Safetensors, GGUF, multiples runtimes | Llama 3.1 Community License | Alternativa densa de tamano similar, con licencia con restricciones de uso |
| Mistral 7B Instruct | 7B | 32K (segun documentacion de Mistral) | Safetensors, GGUF, multiples runtimes | Apache 2.0 | Alternativa algo menor, ampliamente soportada por herramientas |

## Limitaciones y advertencias

- El propio autor advierte de que el modelo "puede cometer errores, incluidos errores con confianza" y recomienda verificar cualquier dato importante.
- El conocimiento esta limitado a los datos de entrenamiento del modelo base; no navega por la web, no ve imagenes, no lee archivos ni ejecuta codigo.
- El autor senala que los niveles de menor tamano son mas debiles en matematicas multi-paso e instrucciones largas y detalladas.
- Los datos de ajuste fino son mayoritariamente en ingles, por lo que el rendimiento en castellano u otros idiomas puede degradarse respecto al Qwen3-8B original.
- Riesgo de alucinacion inherente a un modelo de 8B ajustado con un dataset SFT no documentado.
- Sesgos conocidos: no disponibles en la informacion proporcionada; deben asumirse los del modelo base y los del dataset de ajuste, no auditado publicamente.
- Licencia Apache 2.0 permite uso comercial, pero el autor incluye un aviso NOTICE y aclara que AbelAI no esta afiliado ni respaldado por el equipo Qwen ni por Alibaba Cloud; conviene revisar el NOTICE antes de redistribuir.
- Solo se publican artefactos MLC-LLM para WebGPU; no hay pesos en safetensors ni GGUF, lo que limita su uso en otros runtimes.
- El repositorio tiene un numero de descargas muy bajo (10) y ninguna validacion externa, por lo que no debe considerarse un modelo estable para produccion.
- La fecha de creacion indicada (2026-10-31) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/therealabela/abelai-8b-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Demo en navegador: https://achenkunju.com/abelai/
- MLC-LLM: https://github.com/mlc-ai/mlc-llm
- WebLLM: https://github.com/mlc-ai/web-llm
