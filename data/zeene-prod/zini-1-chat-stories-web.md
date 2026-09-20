# zeene-prod/ZINI-1-CHAT-STORIES-web

## Resumen

ZINI-1-CHAT-STORIES-web es una exportación a ONNX del modelo Qwen2.5-0.5B-Instruct, publicada por el usuario zeene-prod con el objetivo de ejecutar un chatbot narrativo directamente en el navegador mediante Transformers.js, sin servidor ni API externa. No se trata de un modelo entrenado desde cero ni de un ajuste fino documentado: la propia model card indica que los pesos se redistribuyen sin cambios ("redistributed unchanged") y que la exportación ONNX procede del proyecto onnx-community. La etiqueta "ZINI-1-CHAT-STORIES" corresponde, por tanto, a la configuración de prompt y al producto de demostración, no a un conjunto de pesos nuevo.

El modelo subyacente es un transformer causal decoder-only de la familia Qwen2.5, con aproximadamente 0,5 B de parámetros (0,49 B), licencia Apache-2.0 y entrenamiento original en inglés y chino por parte del equipo Qwen de Alibaba Cloud. Su relevancia práctica está en el formato de despliegue: incluye tres variantes ONNX cuantizadas (q4f16 de ~483 MB, int8 de ~512 MB y fp16 de ~1 GB) que permiten inferencia 100 % local en el cliente, con WebGPU como ruta rápida y WASM como ruta universal.

El caso de uso declarado es la narración de historias y la escritura creativa conversacional en inglés. Al ser un modelo de 0,5 B, su utilidad real es la de un componente ligero para demos, prototipos y aplicaciones sin backend, no la de un sistema de producción con requisitos altos de razonamiento o de calidad lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (familia Qwen2.5), exportado a ONNX |
| Parametros totales | ~0,49 B (nomenclatura comercial 0,5 B) segun el modelo base Qwen2.5-0.5B-Instruct; no se detalla en este repositorio |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No confirmada en este repositorio; el modelo base declara 32.768 tokens |
| Tipos de cuantizacion | ONNX q4f16 (~483 MB), ONNX int8 (~512 MB), ONNX fp16 (~1 GB). No se incluyen GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model_q4f16.onnx, model_int8.onnx, model_fp16.onnx) |
| Libreria y runtime | transformers.js 3.8.1 (ONNX Runtime Web; backend WebGPU o WASM) |
| Tamano del repositorio | 6,0 GB |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-0.5B-Instruct: un transformer causal decoder-only denso con atención completa, normalización RMSNorm y embeddings rotatorios (RoPE), en la variante de 0,5 B de la familia Qwen2.5. No hay innovaciones arquitectónicas propias de este repositorio: la contribución técnica es exclusivamente la conversión a ONNX y la selección de tres variantes de cuantización pensadas para ejecución en navegador. La variante q4f16 combina pesos de 4 bits con activaciones en fp16 y es la recomendada para WebGPU; int8 se orienta a WASM (compatible con cualquier dispositivo, más lenta); fp16 ofrece la máxima fidelidad a costa de duplicar el tamaño.

No se documenta en la información disponible ningún proceso de ajuste fino, RLHF o DPO específico para la tarea de narración. El modelo base Qwen2.5-0.5B-Instruct ya incorpora el post-entrenamiento de instrucciones del equipo Qwen, pero este repositorio no aporta datos sobre tokens de entrenamiento, composición del dataset ni recetas de alineación adicionales. Tampoco se documenta decodificación especulativa ni optimizaciones de atención más allá de las que aplica ONNX Runtime Web por defecto.

## Capacidades

- Generación de texto conversacional y narrativo en inglés: cuentos, relatos, diálogos y continuaciones creativas.
- Modo chat con formato de instrucciones heredado de Qwen2.5-0.5B-Instruct (turnos de sistema, usuario y asistente).
- Escritura creativa con control de temperatura y top-p, tal como muestra el ejemplo de la model card (`temperature: 1.0`, `top_p: 0.95`, `max_new_tokens: 300`).
- Ejecución totalmente local en el navegador tras una descarga única de unos 0,5 GB en la variante q4f16, con caché del navegador.
- Compatibilidad con WebGPU cuando el navegador la expone y retroceso automático a WASM en caso contrario (patrón `navigator.gpu ? "webgpu" : "wasm"`).
- Integración como pipeline de Transformers.js cargado desde CDN, sin instalación ni backend Python.
- No se documenta soporte de tool calling ni de function calling en esta model card.
- No se documentan capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- Capacidad multilingüe no documentada: el repositorio declara únicamente inglés, aunque el modelo base se entrenó con datos multilingües.

## Casos de uso

- Demo web sin backend: incrustar el pipeline de Transformers.js en una página estática para ofrecer un chatbot narrativo funcional sin servidor, sin cuotas de API y sin cuentas de usuario, apoyándose en la variante q4f16 y en la caché del navegador.
- Aplicaciones con requisitos de privacidad: al ejecutarse íntegramente en el cliente, ningún texto del usuario abandona el dispositivo, lo que resulta adecuado para diarios personales, cuadernos de escritura o herramientas de introspección.
- Generador de cuentos infantiles offline: PWA o lector de cuentos que produce relatos breves a partir de una premisa del usuario, funcionando sin conexión tras la primera carga.
- Asistente de escritura creativa para bloqueos de autor: sugerencias de continuaciones, variaciones de una escena o listas de ideas a partir de un fragmento existente, con temperatura alta para maximizar la diversidad.
- Prototipado rápido de interfaces conversacionales: validar la experiencia de usuario (streaming, longitud de respuesta, tono) antes de invertir en un modelo mayor o en infraestructura de servidor.
- Instalaciones de demostración y ferias: kioscos o puestos con conectividad limitada donde el modelo se precarga una vez y opera de forma autónoma durante toda la jornada.
- Extensiones de navegador: asistente de escritura integrado en un editor web o en un cliente de correo que genera borradores creativos sin llamadas a servicios externos.
- Generación de material de guionización: producción de sinopsis, descripciones de personajes o prompts de storyboard para equipos de diseño que necesitan borradores rápidos y desechables.
- Educacion y talleres: ejercicios de escritura asistida en aulas con hardware modesto, ya que la variante int8 se ejecuta por CPU vía WASM sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna evaluación (MMLU, HumanEval, GSM8K ni métricas de calidad narrativa), y tampoco se han encontrado datos de benchmarks en los resultados de búsqueda web, que no devolvieron material relacionado con el modelo.

## Requisitos de hardware

- Memoria para la variante q4f16 (~483 MB en disco): apta para GPUs integradas modernas, GPUs de portátil y cualquier GPU de escritorio con soporte de WebGPU. Huella en memoria del dispositivo del orden de 0,5 a 0,8 GB, orientativa según el navegador y el backend.
- Memoria para la variante int8 (~512 MB en disco): ejecutable por CPU mediante WASM en prácticamente cualquier equipo, con velocidad notablemente inferior a WebGPU.
- Memoria para la variante fp16 (~1 GB en disco): requiere WebGPU y al menos 1 a 1,5 GB de memoria gráfica disponible; es la opción de mayor calidad.
- GPU de servidor (A100, H100): no son necesarias ni es el escenario previsto. El modelo está diseñado para cómputo en el cliente; usar hardware de centro de datos para 0,5 B solo tendría sentido para servir muchas peticiones concurrentes con un runtime ONNX en servidor.
- GPU de consumo: cabe sin problemas en cualquier RTX 30/40, en GPUs integradas recientes (Intel Iris Xe, AMD Radeon integrada, Apple Silicon) y en móviles compatibles con WebGPU, siempre que el navegador lo permita.
- Opciones de despliegue: Transformers.js 3.8.1 en navegador (WebGPU o WASM), ONNX Runtime Web, o ONNX Runtime en Node/escritorio. No hay pesos GGUF en el repositorio, por lo que llama.cpp y Ollama no funcionan directamente sin una conversión previa desde el modelo base; tampoco se incluyen safetensors para vLLM o TGI.
- Latencia y throughput: no disponibles. La model card no publica cifras de tokens por segundo ni de tiempo de primera respuesta para ningún backend.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus fichas públicas y deben verificarse antes de tomar decisiones de producción; los campos no confirmados se marcan como no disponibles.

| Modelo | Parametros | Licencia | Formato listo para navegador | Notas |
|---|---|---|---|---|
| ZINI-1-CHAT-STORIES-web | ~0,49 B | Apache-2.0 | Si (ONNX q4f16, int8, fp16) | Exportación sin cambios de Qwen2.5-0.5B-Instruct; sin benchmarks ni validación de la comunidad (0 descargas, 0 likes) |
| Qwen/Qwen2.5-0.5B-Instruct | ~0,49 B | Apache-2.0 | No en el repositorio oficial (safetensors); existe conversión en onnx-community | Mismos pesos; incluye todos los idiomas del entrenamiento original y todas las variantes de tamaño |
| onnx-community/Qwen2.5-0.5B-Instruct | ~0,49 B | Apache-2.0 | Si (ONNX, más variantes que este repositorio) | Fuente directa de la exportación; ofrece un conjunto más amplio de cuantizaciones |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 B | Apache-2.0 | No en el repositorio oficial; existen conversiones ONNX de terceros | Misma familia y licencia, con mayor calidad de texto a cambio de más memoria y menor velocidad en navegador |
| SmolLM2-360M-Instruct | ~0,36 B | Apache-2.0 | Existen conversiones ONNX de la comunidad | Alternativa de tamaño comparable orientada a dispositivos; contexto y rendimiento, no disponibles en esta comparación |
| Llama-3.2-1B-Instruct | ~1,23 B | Licencia comunitaria de Llama 3.2 | Existen conversiones ONNX de la comunidad | Mayor tamaño y licencia con restricciones adicionales frente a Apache-2.0 |

## Limitaciones y advertencias

- Capacidad limitada intrínseca: con ~0,49 B de parámetros, la coherencia decae rápidamente en textos largos, la memoria de hechos es baja y la tasa de alucinación es alta. No es adecuado para respuestas factuales, cálculo fiable ni razonamiento complejo.
- Sin ajuste fino documentado: la model card indica que los pesos se redistribuyen sin cambios, por lo que el comportamiento "de narración de historias" depende del prompt y de los parámetros de muestreo, no de un entrenamiento específico. Cualquier expectativa de especialización debe validarse empíricamente.
- Idioma: solo se declara inglés. El uso en castellano no está soportado ni evaluado, y la calidad esperada en español es baja.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia cuantitativa de calidad, seguridad o robustez, y el repositorio no tiene descargas ni likes que permitan inferir validación por parte de la comunidad.
- Formatos limitados: no se incluyen GGUF, AWQ ni GPTQ, y no hay safetensors. Esto bloquea el uso directo con llama.cpp, Ollama, vLLM o TGI sin convertir previamente el modelo base.
- Discrepancia de tamaño: el repositorio declara 6,0 GB, mientras que las tres variantes ONNX listadas suman aproximadamente 2 GB. Conviene revisar los archivos reales del repositorio antes de asumir el contenido.
- Pérdida de calidad por cuantización: la variante q4f16, la más práctica para WebGPU, introduce degradación adicional sobre un modelo que ya parte de una capacidad reducida. Para máxima fidelidad hay que usar fp16, con el doble de memoria.
- Dependencia del navegador: WebGPU no está disponible en todas las versiones ni en todos los dispositivos; en esos casos se recurre a WASM, con latencias mucho mayores y riesgo de bloqueo de la interfaz si no se ejecuta en un worker.
- Ausencia de moderación: no se documenta ningún filtro de seguridad. Un modelo pequeño de este tipo puede producir contenido sesgado, ofensivo o inapropiado, por lo que en aplicaciones abiertas al público se requieren capas de moderación externas.
- Licencia: Apache-2.0 permite uso comercial, pero la atribución a Alibaba Cloud / equipo Qwen y a onnx-community debe mantenerse, y la licencia del modelo base debe respetarse en cualquier redistribución.
- Metadatos atípicos: la fecha de creación registrada (2026-09-20) es posterior a la fecha de consulta habitual y no se corresponde con la cronología conocida de Qwen2.5, lo que sugiere un error de metadatos; conviene no basar decisiones en esas fechas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/zeene-prod/ZINI-1-CHAT-STORIES-web
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/main/LICENSE
- Exportación ONNX de origen: https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct
- Space de demostración: https://huggingface.co/spaces/zeene-prod/ZINI-1-CHAT-STORIES-demo
- Transformers.js: https://github.com/huggingface/transformers.js
- Los resultados de búsqueda web obtenidos no contenían ningún enlace relacionado con el modelo (devolvieron páginas de soporte de YouTube y artículos de bicicletas sin relación), por lo que no se añaden más referencias.
