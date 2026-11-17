# zaydsyed/Qwen2.5-0.5B-Instruct-DPO-q0f16-MLC

## Resumen

TactLM-Instruction-DPO-Qwen2.5-0.5B-q0f16-MLC es un artefacto de despliegue publicado por el usuario zaydsyed en Hugging Face: se trata del modelo TactLM-Instruction-DPO-Qwen2.5-0.5B convertido al formato MLC (Machine Learning Compilation) para su ejecución en el navegador mediante WebLLM y WebGPU. No es un modelo entrenado desde cero, sino una conversión de pesos en precisión fp16 sin cuantización (variante `q0f16`, 1,0 GB) del checkpoint DPO derivado de Qwen2.5-0.5B-Instruct.

La relevancia de esta ficha es operativa: permite ejecutar un modelo conversacional de 0,5 mil millones de parámetros íntegramente en el cliente, sin backend, a través de WebGPU. Al mantener la arquitectura original de Qwen2.5, el build reutiliza la librería precompilada `Qwen2.5-0.5B-Instruct-q0f16` de WebLLM, por lo que no requiere compilación personalizada de shaders ni kernels.

La información pública del autor es mínima: no se documentan datos de entrenamiento, benchmarks ni detalles del proceso DPO en esta model card, que remite a la del modelo original. Todo lo que sigue distingue explícitamente entre lo heredado de Qwen2.5-0.5B-Instruct, lo declarado por el autor y lo que queda como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, sin cambios respecto a Qwen2.5-0.5B-Instruct) |
| Parametros totales | 0,5 mil millones (heredado de Qwen2.5-0.5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32 768 tokens, dato no confirmado para este build) |
| Tipos de cuantizacion | fp16 sin cuantizar (q0f16); el pipeline MLC permite otras variantes, no documentadas aqui |
| Idiomas soportados | en (declarado en la model card y en los tags) |
| Licencia | apache-2.0 |
| Formato de pesos | MLC (artefacto compilado para WebLLM; repo de 1,0 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos SSM. El autor afirma explícitamente que «the architecture is unchanged from Qwen2.5-0.5B-Instruct», de modo que este repositorio no introduce modificaciones estructurales: solo cambia el formato de serialización de los pesos a MLC y la configuración de generación (`gen_config` con plantilla de conversación `qwen2` y `prefill-chunk-size` de 1024).

Sobre el entrenamiento, la model card no aporta detalles: no se especifican tokens vistos, composición del dataset, hiperparámetros del DPO ni si hubo una etapa GRPO previa o posterior (el nombre del modelo base menciona «Instruction DPO + GRPO», pero sin cifras). Tampoco se documentan técnicas como decodificación especulativa o atención lineal. La conversión se realizó con `mlc_llm convert_weight ... --quantization q0f16`, preservando precisión fp16 y, según el autor, sin pérdida de calidad respecto al checkpoint original.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat Qwen2, orientada a instrucciones.
- Alineación por preferencias mediante DPO sobre el checkpoint base (según el nombre del modelo base; sin métricas publicadas).
- Ejecución en navegador mediante WebLLM sobre WebGPU, con requisito de la extensión `shader-f16`.
- API compatible con OpenAI Chat Completions a través de `@mlc-ai/web-llm` (`engine.chat.completions.create`).
- Capacidad multilingüe limitada: solo inglés declarado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, visión, audio o agentes multi-paso: no disponible.
- Razonamiento avanzado y matemáticas: no documentado; el tamaño de 0,5 B impone límites prácticos.

## Casos de uso

- Asistentes embebidos en aplicaciones web con privacidad por diseño: el modelo se ejecuta íntegramente en el cliente vía WebGPU, por lo que ninguna conversación abandona el navegador; adecuado para formularios de ayuda, FAQs o guías interactivas donde no se quiere depender de un backend.
- Demos y prototipos de producto sin infraestructura: permite validar flujos conversacionales en una landing o un notebook web sin aprovisionar GPUs ni endpoints, gracias al uso de la librería precompilada de WebLLM.
- Educación y experimentación con DPO: sirve como ejemplo didáctico de cómo un checkpoint afinado por preferencias puede desplegarse en el navegador manteniendo la plantilla de chat Qwen2.
- Procesamiento de texto local en entornos con conectividad intermitente: una vez cacheado el artefacto de 1,0 GB, la inferencia no requiere red, útil en aplicaciones de escritorio web o PWA.
- Generación de texto auxiliar de bajo coste: resúmenes cortos, reescritura de frases o respuestas a preguntas simples en inglés dentro de interfaces web, donde la latencia de red es cero.
- Evaluación comparativa de formatos de despliegue: útil para medir el coste de ejecutar fp16 frente a cuantizaciones q4f16/q4f32 en el mismo hardware de cliente, aunque el autor no publica cifras de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la del modelo original (`zaydsyed/TactLM-Instruction-DPO-Qwen2.5-0.5B`) para métricas, sin incluirlas aquí. Tampoco se documentan latencias ni throughput medidos en navegador.

## Requisitos de hardware

- VRAM/GPU de cliente: el modelo se ejecuta en el navegador sobre WebGPU; requiere una GPU con soporte de la extensión `shader-f16` (la mayoría de GPUs integradas y dedicadas recientes de Intel, AMD, NVIDIA y Apple Silicon).
- Huella de memoria: artefacto de 1,0 GB en fp16; la memoria de trabajo añade KV cache y buffers, por lo que conviene disponer de varios GB de VRAM compartida o dedicada.
- GPU dedicadas: cualquier RTX 20xx o superior, así como iGPU recientes, pueden ejecutarlo; no se requieren A100/H100, que sobredimensionan el modelo.
- Despliegue: WebLLM (`@mlc-ai/web-llm`) en navegador; alternativamente, el runtime MLC-LLM nativo para escritorio o servidor.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del backend WebGPU y del hardware del cliente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| TactLM-Instruction-DPO-Qwen2.5-0.5B-q0f16-MLC (este) | 0,5 B | no disponible | MLC fp16 | apache-2.0 | Si (WebLLM + WebGPU) |
| Qwen2.5-0.5B-Instruct (original) | 0,5 B | 32 768 (segun documentacion de Qwen) | safetensors | apache-2.0 | No nativo |
| TactLM-Instruction-DPO-Qwen2.5-0.5B (base de este build) | 0,5 B | no disponible | safetensors | apache-2.0 | No nativo |
| Otras variantes MLC de Qwen2.5-0.5B-Instruct | 0,5 B | heredado | MLC (q4f16, q0f16) | apache-2.0 | Si (WebLLM) |

La comparación de rendimiento no puede establecerse: no hay benchmarks publicados para este build ni para su checkpoint DPO en la información disponible.

## Limitaciones y advertencias

- Tamaño muy reducido (0,5 B): alta probabilidad de alucinación y razonamiento limitado en tareas de varios pasos, matemáticas o código complejo.
- Solo inglés declarado; no se garantiza calidad en castellano ni en otros idiomas.
- No hay benchmarks ni evaluación independiente publicados para este build ni para el checkpoint DPO del que deriva.
- El repositorio es un artefacto de conversión, no un modelo nuevo: cualquier limitación del modelo base se hereda sin cambios.
- Requiere WebGPU con `shader-f16`; navegadores o GPUs sin esa extensión no pueden ejecutarlo.
- Descarga inicial de 1,0 GB en el cliente, lo que afecta al primer arranque y al consumo de datos del usuario.
- Licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5 y del checkpoint DPO original antes de desplegar en producción.
- Sin garantías de mantenimiento: el autor tiene 0 likes y 24 descargas en el momento de la consulta, lo que sugiere un proyecto de baja tracción.

## Enlaces

- Hugging Face (este build): https://huggingface.co/zaydsyed/Qwen2.5-0.5B-Instruct-DPO-q0f16-MLC
- Modelo base DPO: https://huggingface.co/zaydsyed/TactLM-Instruction-DPO-Qwen2.5-0.5B
- MLC-LLM: https://github.com/mlc-ai/mlc-llm
- WebLLM: https://github.com/mlc-ai/web-llm
- Paquete npm: https://www.npmjs.com/package/@mlc-ai/web-llm
