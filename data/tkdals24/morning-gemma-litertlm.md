# tkdals24/morning-gemma-litertlm

## Resumen

morning-gemma es un modelo derivado de Google Gemma 4 E2B-it, afinado mediante LoRA por el usuario tkdals24 para una aplicación coreana de despertador conversacional llamada "AI 모닝콜". El modelo base es un modelo de instrucciones de Google orientado a ejecución en dispositivo, y este derivado se distribuye en formato `.litertlm`, el formato optimizado para LiteRT-LM, el runtime de inferencia de Google AI Edge para Android con aceleración por GPU o CPU.

El problema que resuelve es muy concreto: generar diálogos de llamada de despertador en coreano, con nombres, horarios y meteorología inventados, manteniendo un registro educado y evitando repeticiones o cesiones en la conversación. No se trata de un modelo de propósito general, sino de un artefacto especializado para un producto de consumo móvil.

La relevancia es limitada pero ilustrativa: muestra el flujo completo de adaptación de un modelo Gemma 4 a un caso de uso vertical mediante LoRA, seguido de conversión a LiteRT-LM para despliegue on-device en Android. El repositorio ocupa 2,6 GB, el modelo es solo de texto y no incluye los componentes de visión, audio ni el drafter MTP del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B-it), con adaptadores LoRA en capas de atención y MLP |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens de caché (cache_length=4096 en la conversión); prefill_lengths=[128] |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye como `.litertlm` de 2,6 GB) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); incluye `manifest.json` con versión, tamaño y SHA-256 |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer de la familia Gemma 4 en su variante E2B de instrucciones. Sobre él se aplicó un ajuste fino con LoRA en las capas de atención y MLP, sin tocar el `per_layer_embedder`, que se toma del artefacto oficial `litert-community/gemma-4-E2B-it-litert-lm`. El embedder oficial devuelve valores sin escalar, por lo que el decodificador multiplica `per_layer_embeddings` por √256 = 16.

El conjunto de entrenamiento son 274 llamadas de despertador **sintéticas**: nombres, horarios y meteorología inventados. Un modelo profesor generó cada respuesta y solo se conservaron aquellas que pasaban las comprobaciones de diálogo de la aplicación (registro educado, ausencia de palabras extranjeras, no rendirse, no repetirse, expresiones de despertar). No se usaron conversaciones reales de usuarios. La pérdida de evaluación pasó de 0,459 a 0,419 tras el ajuste.

La conversión a LiteRT-LM se realizó con `litert-torch export_hf`, usando `prefill_lengths=[128]`, `cache_length=4096` y `experimental_lightweight_conversion=True`. El resultado no incluye los componentes de visión, audio ni el drafter MTP del modelo base.

## Capacidades

- Generación de texto conversacional en coreano, orientada a diálogos de llamada de despertador.
- Mantenimiento de registro educado y consistencia de estilo según las comprobaciones de diálogo usadas en el filtrado de datos.
- Conversación multi-turno dentro de una ventana de caché de 4096 tokens.
- Ejecución on-device en Android mediante LiteRT-LM, con soporte de GPU y CPU.
- No incluye visión, audio ni decodificación especulativa MTP (componentes excluidos en la conversión).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de la conversación.
- Capacidad multilingüe limitada al coreano según la model card.

## Casos de uso

- Despertador conversacional en Android: la aplicación "AI 모닝콜" usa el modelo para iniciar una llamada de voz simulada que despierta al usuario con diálogo natural; el formato `.litertlm` permite ejecutarlo en el propio dispositivo sin enviar audio ni texto a servidores.
- Generación de guiones de despertar personalizados: nombres, horarios y meteorología inventados permiten producir variaciones de la llamada sin datos reales del usuario, útil para pruebas de producto y demostraciones.
- Prototipado de asistentes de voz on-device: sirve como referencia para equipos que quieran adaptar Gemma 4 a un dominio vertical con LoRA y desplegarlo con LiteRT-LM en Android.
- Verificación de actualizaciones de modelo en producción: el `manifest.json` con versión, tamaño y SHA-256 permite a la app comprobar integridad y gestionar descargas de nuevas versiones.
- Investigación sobre ajuste fino con datos sintéticos: el pipeline de generación por modelo profesor y filtrado por reglas de diálogo es un ejemplo reproducible de destilación de estilo conversacional.
- Base para experimentos de diálogo de dominio restringido: el ajuste LoRA sobre un modelo E2B permite estudiar cuánto estilo se puede inculcar con pocos cientos de ejemplos sintéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación reportado es la pérdida de evaluación del ajuste LoRA, que pasó de 0,459 a 0,419.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el artefacto `.litertlm` ocupa 2,6 GB en disco y está pensado para ejecución on-device.
- GPU recomendadas: no disponible; la model card indica soporte de GPU y CPU en Android mediante LiteRT-LM.
- Cabe en GPU de consumo: no disponible como dato verificado; el tamaño del artefacto (2,6 GB) sugiere que puede ejecutarse en dispositivos móviles de gama alta, pero no se especifican requisitos de memoria.
- Opciones de despliegue: LiteRT-LM (Android, GPU/CPU) es el runtime documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| morning-gemma-litertlm | no disponible | 4096 (caché) | Apache 2.0 | `.litertlm` | Hugging Face, 0 descargas |
| google/gemma-4-E2B-it | no disponible | no disponible | Apache 2.0 | safetensors (presumible) | Hugging Face, modelo base |
| litert-community/gemma-4-E2B-it-litert-lm | no disponible | no disponible | Apache 2.0 | `.litertlm` | Hugging Face, artefacto oficial de referencia |

La comparativa se limita a la familia Gemma 4 porque la información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de otros fabricantes.

## Limitaciones y advertencias

- Entrenado exclusivamente con 274 llamadas sintéticas en coreano; el dominio y el idioma están muy restringidos y el rendimiento fuera de ese contexto no está documentado.
- Riesgo de alucinación en nombres, horarios y meteorología: el modelo fue entrenado para inventarlos, por lo que no debe usarse como fuente de datos reales.
- No incluye visión, audio ni drafter MTP, por lo que no puede procesar entradas multimodales ni aprovechar decodificación especulativa.
- El ajuste LoRA no tocó el `per_layer_embedder`; cualquier cambio en el embedder oficial requeriría revisar la conversión y el factor de escala √256.
- Licencia Apache 2.0 declarada por el autor, heredada de Gemma 4; conviene verificar los términos de uso de Gemma 4 de Google antes de un despliegue comercial.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- El repositorio se creó y actualizó el 2026-11-21, con una ventana de menos de un minuto entre creación y actualización; no hay historial de versiones.
- No se documentan sesgos específicos, pero al ser un ajuste sobre Gemma 4 con datos sintéticos coreanos, puede heredar sesgos del modelo base y del modelo profesor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tkdals24/morning-gemma-litertlm
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Artefacto oficial LiteRT-LM de Gemma 4 E2B-it: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
