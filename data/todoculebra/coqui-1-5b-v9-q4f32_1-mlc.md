# todoculebra/coqui-1.5b-v9-q4f32_1-MLC

## Resumen

Coquí 1.5B v9 es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B-Instruct desarrollado por Isla Tech LLC (Todo Culebra, Culebra, Puerto Rico) y distribuido en el formato de MLC LLM / web-llm. Su propósito es acotado y explícito: responder preguntas de viaje sobre Culebra, Vieques, San Juan y las Islas Vírgenes de Estados Unidos en inglés y español, a partir de las notas offline que la aplicación lleva empaquetadas. No es un modelo de propósito general, sino un componente de un producto concreto (https://todoculebra.com/app).

El interés técnico está en el modo de despliegue: al estar convertido a MLC, el modelo se ejecuta íntegramente en el navegador mediante WebGPU, sin conexión a internet y sin servidor. Con 1.500 millones de parámetros y cuantización de 4 bits, el repositorio ocupa 0,9 GB, lo que lo sitúa en el rango de dispositivos móviles y portátiles convencionales.

La model card reporta dos métricas de evaluación internas (207/211 en su test de la isla y 36/50 en preguntas nuevas de huéspedes), aunque ambas se obtuvieron dentro de la aplicación, con sus notas y su código, por lo que no equivalen a un benchmark del modelo en aislamiento. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct); detalles de capas y atención no disponibles en la información proporcionada |
| Parametros totales | 1,5 mil millones (1.5B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (la model card no la especifica para este fine-tune) |
| Tipos de cuantizacion | q4f32_1 (este repositorio) y q4f16_1 (variante para dispositivos con soporte shader-f16); cuantización de grupo propia de MLC LLM |
| Idiomas soportados | Inglés (en) y español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (mlc-llm), compatible con web-llm y ejecución en navegador vía WebGPU; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5B parámetros, y se ha ajustado de forma supervisada sobre pares pregunta/respuesta redactados a partir de las notas públicas de viaje de Todo Culebra. Según la model card, esos pares fueron generados por un modelo profesor abierto y cada uno se verificó contra la nota correspondiente antes de entrenar. No se utilizaron conversaciones reales de huéspedes. No se especifican el volumen de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO adicionales.

La innovación relevante no está en la arquitectura sino en la cadena de despliegue: el fine-tune se convierte al formato MLC y reutiliza la librería de modelo precompilada de web-llm para Qwen2.5-1.5B-Instruct, lo que permite inferencia local en el navegador con WebGPU y sin red. Se distribuyen dos variantes de cuantización para cubrir tanto equipos con extensión shader-f16 (móviles y portátiles) como equipos que solo admiten shader-f32.

## Capacidades

- Generación de texto conversacional en formato pregunta/respuesta, orientada a consultas de viaje.
- Cobertura geográfica concreta: Culebra, Vieques, San Juan e Islas Vírgenes de Estados Unidos.
- Bilingüe inglés/español, con etiquetas de idioma declaradas para ambos.
- Ejecución totalmente offline en el navegador del usuario mediante MLC LLM y WebGPU.
- Dos variantes de cuantización (q4f16_1 y q4f32_1) para adaptarse al hardware gráfico disponible.
- Delimitación explícita de alcance: el modelo no responde precios, horarios, teléfonos ni emergencias; la aplicación resuelve esas consultas por código.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- No se declara una ventana de contexto concreta ni capacidades de código o matemáticas más allá de lo que herede del modelo base.

## Casos de uso

- Asistente de viaje offline en navegador: la aplicación integra el modelo con sus notas locales para responder dudas sobre playas, transporte o itinerarios sin conexión, algo útil en islas con cobertura irregular como Culebra o Vieques.
- Consultas bilingües para turistas: al soportar inglés y español, un mismo despliegue atiende a visitantes locales (Puerto Rico) y del continente sin duplicar infraestructura.
- Punto de información en embarcaciones o excursiones: al ejecutarse en el dispositivo y sin red, puede desplegarse en tablets o portátiles a bordo para resolver preguntas frecuentes.
- Reducción de coste de servidor: la inferencia ocurre en el cliente con WebGPU, por lo que no se necesita GPU en la nube ni facturación por token para las consultas cubiertas.
- Prototipado de asistentes de nicho: sirve como plantilla reproducible para adaptar Qwen2.5-1.5B a un dominio vertical pequeño con pares pregunta/respuesta verificados y exportarlo a MLC.
- Derivación controlada de consultas sensibles: el diseño separa el modelo (contenido descriptivo) del código (precios, horarios, teléfonos y emergencias), patrón reutilizable en asistentes donde la exactitud de datos operativos es crítica.
- Demostraciones y pruebas de concepto de web-llm: útil para evaluar latencia y consumo de memoria de un modelo de 1,5B cuantizado a 4 bits en hardware de consumo.

## Benchmarks y rendimiento

| Evaluación | Contexto | Resultado |
|---|---|---|
| Test de la isla (211 preguntas) | Dentro de la app, con sus notas y su código | 207/211 correctas |
| Preguntas nuevas de huéspedes (50) | Dentro de la app, con sus notas y su código; sin ajuste previo sobre ellas | 36/50 correctas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las dos cifras anteriores son evaluaciones de producto y no aíslan la contribución del modelo frente a la de las notas recuperadas y el código de la aplicación, por lo que no son comparables con métricas de modelos de propósito general.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: los pesos cuantizados a 4 bits ocupan aproximadamente 0,8-0,9 GB (el repositorio completo pesa 0,9 GB); con caché KV y el runtime de MLC, el consumo total razonable se sitúa en el entorno de 1,5-2 GB, aunque la model card no publica cifras oficiales.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte de WebGPU; la variante q4f16_1 requiere extensión shader-f16 (habitual en móviles y portátiles recientes), mientras que q4f32_1 cubre equipos sin esa extensión.
- Cabe en GPU de consumo: sí, por tamaño; el límite real es el soporte de WebGPU y shader-f16 del navegador y del dispositivo, no la memoria.
- Opciones de despliegue: MLC LLM y web-llm (navegador, WebGPU). No se distribuyen pesos en GGUF ni safetensors, por lo que llama.cpp, Ollama, vLLM o TGI no son utilizables directamente con este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del backend WebGPU y del dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Rendimiento |
|---|---|---|---|---|---|
| Coquí 1.5B v9 (este modelo) | 1,5B | No disponible | Apache 2.0 | MLC / web-llm, navegador WebGPU | 207/211 y 36/50 en evaluaciones internas de la app |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | No disponible en la información proporcionada | Apache 2.0 | Safetensors y múltiples formatos comunitarios | No disponible |
| Alternativas de tamaño similar (p. ej. Llama 3.2 1B, Gemma 2 2B) | 1-2B | No disponible | Licencias propias de cada familia | Safetensors, GGUF y otros | No disponible |

La comparación directa con el modelo base no puede establecerse con los datos disponibles: no se han publicado métricas del fine-tune sobre benchmarks estándar, y las cifras de la model card corresponden a un sistema con recuperación de notas y código añadido. En la práctica, la ventaja diferencial de Coquí 1.5B v9 frente a alternativas de su tamaño no es el rendimiento bruto, sino el empaquetado listo para web-llm y el ajuste a un dominio muy concreto.

## Limitaciones y advertencias

- Alcance restringido por diseño: no debe usarse para precios, horarios, números de teléfono ni emergencias; la propia model card indica que esas respuestas las genera el código de la aplicación, nunca el modelo.
- Riesgo de alucinación en detalles turísticos (nombres de playas, rutas, servicios) cuando la pregunta queda fuera de las notas con las que se entrenó; el 36/50 en preguntas nuevas (72 %) es un indicador de generalización limitada.
- Dominio y geografía acotados a Culebra, Vieques, San Juan e Islas Vírgenes de Estados Unidos; su uso fuera de ese ámbito no está validado.
- Idiomas limitados a inglés y español; no se declara soporte de otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar conversaciones multi-turno largas con garantías.
- Sin soporte declarado de tool calling, function calling ni flujos de agente, lo que limita su integración en pipelines automatizados.
- Dataset de entrenamiento pequeño y generado sintéticamente por un modelo profesor, con verificación manual contra notas; puede heredar sesgos y errores del profesor y de las notas originales.
- Ausencia de validación externa: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, y las únicas métricas provienen del propio autor.
- Licencia Apache 2.0 permite uso comercial, pero obliga a conservar avisos de copyright y a indicar modificaciones; el modelo base Qwen2.5-1.5B-Instruct mantiene su propia licencia Apache 2.0.
- Los pesos en formato MLC no son directamente portables a otros runners, lo que crea dependencia del ecosistema mlc-llm / web-llm para actualizar o reempaquetar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/todoculebra/coqui-1.5b-v9-q4f32_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Aplicación en producción: https://todoculebra.com/app
- MLC LLM: no disponible en los resultados de búsqueda proporcionados
- web-llm: no disponible en los resultados de búsqueda proporcionados
- Paper o blog técnico del fine-tune: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada

Nota: los resultados de búsqueda web adjuntos tratan sobre recuperación de dispositivos iOS y no guardan relación con este modelo, por lo que no se han utilizado como fuente.
