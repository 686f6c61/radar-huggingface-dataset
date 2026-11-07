# soverius-ai/gemma-4-E2B-it-A2UI-Express-WebLLM

## Resumen

Gemma 4 E2B it A2UI Express WebLLM es un paquete de inferencia en navegador derivado de Gemma 4 E2B, el modelo mas pequeno de la familia Gemma 4 de Google DeepMind. Lo publica el usuario soverius-ai en Hugging Face y no es un modelo entrenado desde cero, sino un fine-tuning mediante LoRA sobre `unsloth/gemma-4-E2B-it` orientado a generar interfaces A2UI (Agent-to-UI) en formato Express. El adaptador resultante se ha fusionado en los pesos base en BF16 y se ha convertido al formato MLC `q4f16_1` para su ejecucion con WebLLM sobre WebGPU.

La relevancia de este artefacto es doble. Por un lado, demuestra el flujo completo de adaptacion de un modelo de 2.100 millones de parametros a una tarea especifica de generacion de UI y su empaquetado para ejecucion 100 % local en el navegador mediante MLC y WebLLM 0.2.87. Por otro, el propio autor documenta en la model card que esta ruta de cuantizacion `q4f16_1` resulto mas lenta (unos 35 segundos hasta el primer token con un prompt de 6.300 tokens en un Apple M5 Max) y menos fiel que la exportacion ONNX equivalente, por lo que recomienda usar el repositorio ONNX en lugar de este.

El repositorio ocupa 2,8 GB, tiene licencia Apache-2.0 para la conversion MLC y el runtime TVM, y los pesos quedan sujetos a los terminos de Gemma. No se han publicado descargas ni valoraciones en el momento de redactar esta ficha, y el pipeline no esta declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), adaptado con LoRA y fusionado en BF16 |
| Parametros totales | 2.100 millones (familia Gemma 4 E2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (8K, segun gemma4.dev para Gemma 4 E2B) |
| Tipos de cuantizacion | `q4f16_1` (MLC, grupos de 4 bits con escala FP16); existen variantes MLX 4-bit y BF16 y exportacion ONNX del mismo adaptador |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (conversion MLC y runtime TVM); pesos sujetos a terminos de Gemma |
| Formato de pesos | MLC (`q4f16_1`), con `model.wasm` de WebLLM 0.2.87 y manifiesto `a2ui-mlc-manifest.json` |

## Arquitectura y entrenamiento

La base es Gemma 4 E2B, un transformer decoder-only de 2.100 millones de parametros, modalidad solo texto y 8K de contexto, disenado para ejecucion en CPU y dispositivos de borde. Sobre esa base se aplico un fine-tuning LoRA orientado a la generacion de interfaces A2UI en la variante Express, partiendo de `unsloth/gemma-4-E2B-it`. El adaptador corresponde al checkpoint 540 con SHA-256 `54c7414491e36610133c5f22e0397a66e97d901e3b119238abf50042dc7aa323`, el mismo que el publicado en el repositorio ONNX del autor.

El proceso de empaquetado consistio en fusionar el adaptador en los pesos BF16 y convertir el resultado a MLC `q4f16_1` parcheando la conversion oficial `mlc-ai/gemma-4-E2B-it-q4f16_1-MLC` (240 grupos, 445 arrays). El paquete se distribuye con el runtime WebLLM 0.2.87 (`model.wasm`) y un descriptor `a2ui-mlc-manifest.json` que el demo verifica, bajo el identificador `gemma-4-e2b-express-54c7414491e3-q4f16_1-MLC`. No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado.

## Capacidades

- Generacion de texto y de interfaces A2UI en formato Express, que es la tarea objetivo del fine-tuning.
- Razonamiento y conversacion multi-turno en ingles y otros idiomas, heredados de la base instruct `gemma-4-E2B-it` (lista exacta de idiomas no disponible).
- Ejecucion local en navegador mediante WebGPU y el runtime WebLLM, sin servidor ni llamadas a API externas.
- Inferencia sobre CPU en escenarios de borde, segun las caracteristicas declaradas de Gemma 4 E2B.
- Integracion con el ecosistema MLC/TVM a traves del manifiesto `a2ui-mlc-manifest.json`.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; la base E2B es solo texto.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de interfaces en el navegador: el modelo produce descripciones A2UI Express que un cliente web puede renderizar directamente, sin enviar datos a un servidor, gracias a la ejecucion local con WebLLM y WebGPU.
- Prototipado de asistentes agenticos con UI dinamica: util para validar flujos en los que el agente decide que componentes mostrar al usuario y los describe en el formato A2UI, con la ventaja de que todo el ciclo ocurre en el dispositivo.
- Demos y pruebas de concepto de IA en el borde: el paquete permite desplegar un modelo de 2.100 millones de parametros en una pagina web, lo que sirve para evaluar latencia y calidad percibida en equipos de usuario final antes de invertir en infraestructura.
- Aplicaciones con requisitos de privacidad: al no requerir backend, los prompts y las respuestas permanecen en el navegador, lo que encaja en escenarios con datos sensibles donde no se permite el envio a la nube.
- Formacion y experimentacion con MLC y WebLLM: el repositorio documenta el parcheo de una conversion oficial y el empaquetado del runtime, por lo que sirve como referencia tecnica para replicar el proceso con otros adaptadores.
- Evaluacion comparativa de rutas de cuantizacion: al existir versiones ONNX, MLX 4-bit y BF16 del mismo adaptador, el paquete permite medir fidelidad y velocidad entre formatos en un mismo hardware, aunque el autor ya advierte que esta ruta es la menos favorable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento documentado es cualitativo y de latencia: aproximadamente 35 segundos hasta el primer token con un prompt de 6.300 tokens sobre un Apple M5 Max, y menor fidelidad que la exportacion ONNX, con cambios de tokens en algunos turnos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con cuantizacion `q4f16_1` sobre 2.100 millones de parametros, el peso de los pesos ronda los 1,2-1,5 GB, a lo que hay que sumar el estado KV para hasta 8K tokens.
- GPU recomendadas: el paquete esta pensado para WebGPU en navegador; el autor cita un Apple M5 Max como equipo de prueba. No se detallan modelos de GPU de escritorio validados.
- GPU de consumo: por tamano, es plausible en GPUs de consumo con soporte WebGPU, pero no hay lista oficial de compatibilidad en la informacion disponible.
- Despliegue: WebLLM 0.2.87 con `model.wasm` y manifiesto `a2ui-mlc-manifest.json`; el ecosistema MLC/TVM es la via natural. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: unos 35 s hasta el primer token con 6.300 tokens de prompt en un M5 Max; no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 E2B it A2UI Express WebLLM (este) | 2.100 M | 8K | MLC `q4f16_1`, WebLLM | Apache-2.0 + terminos Gemma | Fine-tuning A2UI Express; el autor recomienda la variante ONNX por velocidad y fidelidad |
| Gemma 4 E2B it A2UI Express ONNX (soverius-ai) | 2.100 M | 8K | ONNX | Apache-2.0 + terminos Gemma | Mismo adaptador (checkpoint 540); ruta preferida por el autor |
| Gemma 4 E2B it (base, unsloth) | 2.100 M | 8K | safetensors y derivados | Terminos Gemma | Modelo instruct generalista sin ajuste A2UI |
| Gemma 4 E4B it A2UI Express ONNX (soverius-ai) | no disponible | no disponible | ONNX | Apache-2.0 + terminos Gemma | Variante de mayor tamano de la misma familia de adaptadores |

## Limitaciones y advertencias

- El autor indica explicitamente que esta ruta `q4f16_1` es mas lenta y menos fiel que la exportacion ONNX, y que cambia tokens en algunos turnos; recomienda usar el repositorio ONNX.
- La cuantizacion a 4 bits introduce perdida de precision adicional sobre un modelo ya de por si pequeno (2.100 M), lo que puede degradar el cumplimiento estricto del formato A2UI Express.
- Riesgo de alucinacion inherente a un modelo de este tamano, especialmente en tareas de razonamiento complejo o contextos largos cerca del limite de 8K tokens.
- Sesgos conocidos: no documentados en la informacion disponible; deben asumirse los de la base Gemma 4 E2B.
- Idiomas soportados: no disponibles; la model card no detalla cobertura linguistica.
- Licencia: la conversion MLC y el runtime TVM son Apache-2.0, pero los pesos quedan sujetos a los terminos de Gemma, que incluyen restricciones de uso que deben revisarse antes de un despliegue comercial.
- El repositorio no registra descargas ni valoraciones, y el pipeline no esta declarado; la madurez y el mantenimiento del paquete no estan contrastados por la comunidad.
- Dependencia de WebGPU: la ejecucion en navegador requiere un navegador y un hardware compatibles, lo que limita la base de usuarios alcanzable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/soverius-ai/gemma-4-E2B-it-A2UI-Express-WebLLM
- Repositorio ONNX recomendado por el autor: https://huggingface.co/soverius-ai/gemma-4-E2B-it-A2UI-Express-ONNX
- Perfil del autor: https://huggingface.co/soverius-ai
- Modelo base del fine-tuning: https://huggingface.co/unsloth/gemma-4-E2B-it
- Conversion MLC oficial parcheada: https://huggingface.co/mlc-ai/gemma-4-E2B-it-q4f16_1-MLC
- Ficha de Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
