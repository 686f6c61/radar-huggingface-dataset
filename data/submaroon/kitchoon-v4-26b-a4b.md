# SubMaroon/Kitchoon-V4-26B-A4B

## Resumen

Kitchoon-V4-26B-A4B es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 25.805.933.872 parámetros totales y aproximadamente 4.000 millones de parámetros activos por token (la designación A4B indica la activación de 4B). Lo desarrolla el usuario independiente SubMaroon como una variante de la familia Kitchoon, orientada específicamente a roleplay (RP) y contenido para adultos (ERP), con un estilo de escritura neutro y énfasis en el desarrollo de personajes. Está construido sobre la arquitectura Gemma 4 y deriva directamente de Kitchoon-V3-26B-A4B.

La versión V4 no introduce un reentrenamiento completo, sino que integra dos LoRA sobre el modelo V3: Gemory (de UltimateIntent), aplicada a atención, MLP densa y expertos MoE para hacer más vivas e individuales las reacciones de los personajes, y Anthropos l07 (del propio autor), una LoRA de punto de decisión aplicada a las capas 13-23 para reducir la repetición al inicio de las respuestas. La fusión se realizó con redondeo estocástico en bf16 para preservar la intensidad probada de las LoRA.

El modelo es relevante en el nicho de los modelos "uncensored"/"heretic" para roleplay local, con licencia Apache 2.0 y pesos en safetensors (repositorio de 51,6 GB). Su principal advertencia es que el modo "thinking" no se detiene automáticamente, lo que exige configurar un presupuesto de razonamiento explícito en el motor de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Gemma 4, con atención, MLP densa y expertos MoE |
| Parametros totales | 25.805.933.872 (25,8 B) |
| Parametros activos | ~4 B (designación A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor verifica compatibilidad con llama.cpp) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer MoE de tipo Gemma 4 con 25,8 B de parámetros totales y unos 4 B activos. Incluye una torre de visión (vision tower) que, según la model card, permanece idéntica a la de V3. La arquitectura combina capas de atención, MLP densa y expertos MoE enrutados, y el autor distingue explícitamente qué componentes se modificaron en la fusión de las LoRA.

El entrenamiento de V4 no parte de cero: se construye fusionando dos LoRA sobre Kitchoon-V3-26B-A4B. Gemory se aplica con fuerza 0,5 en atención y MLP densa de todas las capas, y con fuerza 0,5 × 0,25 (corrección) en los expertos MoE de todas las capas, con rango 16 y rango 4 respectivamente. Anthropos l07 se aplica con fuerza 0,7 en atención y MLP densa de las capas 13-23, con rango 16. El `lm_head`, el router, los embeddings y la torre de visión se mantienen idénticos a V3. La fusión emplea redondeo estocástico en bf16, y el autor indica que la verificación en llama.cpp confirma que V4 coincide con V3 más las LoRA fusionadas. No se detalla el volumen de tokens de entrenamiento ni la composición del dataset de las LoRA.

## Capacidades

- Generación de texto orientada a roleplay y ERP, con estilo de escritura neutro y foco en el desarrollo de personajes.
- Interacción multi-personaje: según el autor, los personajes reaccionan de forma más individual, se provocan entre sí y se hablan entre ellos, no solo al usuario.
- Variación en la apertura de respuestas ("swipes"): reduce la repetición de las primeras palabras entre generaciones.
- Modo "thinking" (razonamiento): funciona, pero no se detiene automáticamente; requiere configurar un presupuesto de razonamiento (normal o corto recomendado).
- Con thinking activo, la respuesta final se reescribe a partir del plan del razonamiento en lugar de copiarse del borrador.
- Capacidad de visión: la torre de visión se conserva de V3, aunque la model card no detalla su funcionamiento.
- Idiomas: únicamente inglés según los metadatos; no se documenta soporte multilingüe.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.

## Casos de uso

- Roleplay conversacional en local con SillyTavern: el modelo está diseñado para sesiones de personaje con múltiples turnos y respuestas variadas; requiere fijar Thinking Effort en un valor distinto de Auto para evitar que el razonamiento no termine.
- Roleplay con múltiples personajes en una misma escena: la inclusión de Gemory hace que distintos personajes reaccionen de forma individual y dialoguen entre ellos, útil para escenas de grupo o narrativa coral.
- Ficción interactiva y escritura creativa asistida: el estilo neutro y la variación en la apertura de párrafos permiten generar borradores de escenas sin repetir fórmulas de inicio.
- Contenido para adultos (ERP) en entornos controlados: el modelo es "uncensored"/"heretic" y está pensado para este uso, con licencia Apache 2.0 que permite despliegue privado.
- Experimentación con técnicas de fusión de LoRA: sirve como caso de estudio de integración de LoRA en atención, MLP densa y expertos MoE con redondeo estocástico en bf16 y verificación en llama.cpp.
- Pruebas de motores de inferencia local: el autor verifica el modelo en llama.cpp, por lo que es útil para validar despliegues en cuantizaciones GGUF y comparar el comportamiento con y sin thinking.
- Investigación sobre mitigación de repetición en modelos de rol: la LoRA Anthropos l07 está orientada a reducir la repetición en los puntos de decisión de apertura de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 25,8 B de parámetros totales, los pesos en bf16 ocupan aproximadamente 51,6 GB (tamaño del repositorio), por lo que la inferencia en precisión completa requiere más de 48 GB de VRAM. Las cuantizaciones GGUF reducen este requisito, pero el autor no publica cifras.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, un despliegue en bf16 encajaría en A100 80 GB o H100, y las cuantizaciones podrían permitir GPUs de 24 GB, aunque no hay confirmación del autor.
- ¿Cabe en GPU de consumo? No confirmado; depende de la cuantización y del soporte MoE en el motor.
- Opciones de despliegue: llama.cpp verificado por el autor; SillyTavern como frontend de roleplay. Otros motores (vLLM, TGI, Ollama) no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Kitchoon-V4-26B-A4B | 25,8 B totales / ~4 B activos | no disponible | Apache 2.0 | Roleplay/ERP, MoE Gemma 4 | Hugging Face |
| Kitchoon-V3-26B-A4B | 25,8 B totales / ~4 B activos | no disponible | Apache 2.0 | Roleplay/ERP (base de V4) | Hugging Face |
| Gemory-26B-A4B-LORA | LoRA sobre 26B-A4B | no disponible | no disponible | LoRA de roleplay | Hugging Face |
| Anthropos-LoRA-v2-EXP | LoRA | no disponible | no disponible | LoRA de punto de decisión | Hugging Face |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modo thinking no se detiene automáticamente; en SillyTavern hay que fijar Thinking Effort en un valor distinto de Auto, y en otros motores configurar un Thinking Budget. El autor prevé corregirlo en V5-Final.
- Con razonamiento muy largo (auto) aparecen palabras extrañas ("own" o "quite" mal colocadas) o palabras duplicadas ("her her").
- Las variaciones entre generaciones afectan más a cómo se entrega la escena que a qué ocurre; el beat principal sigue dependiendo de la escena.
- Persisten tics de escritura como "*smirk*" y el guion largo.
- El autor reconoce una cobertura de pruebas estrecha, centrada en sus propias tarjetas, y pide feedback sobre sesiones largas (lógica de escena, quién está dónde, quién habla con quién).
- Modelo "uncensored"/"heretic": puede generar contenido para adultos y material no filtrado; requiere control de uso y adecuación al contexto.
- Idioma limitado al inglés según los metadatos; no se documenta calidad en castellano.
- Licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre el contenido generado ni sobre los datasets de entrenamiento.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Contexto máximo no especificado, lo que dificulta planificar sesiones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SubMaroon/Kitchoon-V4-26B-A4B
- Modelo base (V3): https://huggingface.co/SubMaroon/Kitchoon-V3-26B-A4B
- LoRA Gemory: https://huggingface.co/UltimateIntent/Gemory-26B-A4B-LORA
- LoRA Anthropos: https://huggingface.co/SubMaroon/Anthropos-LoRA-v2-EXP
- Perfil del autor: https://huggingface.co/SubMaroon
- Donaciones (Boosty): https://boosty.to/submaroon/donate
