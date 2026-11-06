# yujin-ai26/qwen3.5-0.8b-labor-lora

## Resumen

`yujin-ai26/qwen3.5-0.8b-labor-lora` es un adaptador LoRA (Low-Rank Adaptation) de bajo rango entrenado sobre el modelo base `Qwen/Qwen3.5-0.8B`, publicado por el usuario `yujin-ai26`. Su propósito es el ajuste fino supervisado (SFT) para responder preguntas de asesoramiento laboral en coreano, a partir del dataset `yujin-ai26/labor-counsel-qa`. No se trata de un modelo completo, sino de un conjunto de pesos delta que debe cargarse junto con el modelo base mediante la librería PEFT.

El adaptador emplea un rango LoRA de 8, `lora_alpha` de 16 y se aplica sobre todas las capas lineales del modelo base (`all-linear`), con una tasa de aprendizaje de 2e-4 y 4 épocas de entrenamiento. El modelo base Qwen3.5-0.8B es un transformer de 0,8 mil millones de parámetros de la familia Qwen, aunque no se dispone de especificaciones detalladas de su arquitectura, contexto o datos de entrenamiento en la información proporcionada.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de especialización vertical de un modelo pequeño mediante LoRA para un dominio regulado (derecho laboral coreano); por otro, sirve de ejemplo de las limitaciones de información que presentan muchos adaptadores publicados en Hugging Face, donde la model card se reduce a una descripción mínima del proceso de entrenamiento. El adaptador cuenta con 14 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-0.8B |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Rango LoRA (r) | 8 |
| lora_alpha | 16 |
| Capas objetivo | all-linear |
| Tasa de aprendizaje | 2e-4 |
| Epocas de entrenamiento | 4 |
| Dataset de entrenamiento | yujin-ai26/labor-counsel-qa |
| Libreria | peft, transformers, trl |
| Tamano del repo | 0.0 GB (aprox., adaptador de bajo rango) |

## Arquitectura y entrenamiento

El adaptador sigue el esquema estándar de LoRA: se congelan los pesos del modelo base `Qwen/Qwen3.5-0.8B` y se insertan matrices de baja descomposición (rango 8) en todas las capas lineales del transformer. Con `lora_alpha` 16, el factor de escala efectivo es de 2 (alpha/r), lo que amplifica la contribución del adaptador durante la inferencia. El entrenamiento se realizó con SFT (supervised fine-tuning) sobre el dataset `yujin-ai26/labor-counsel-qa`, un corpus de pares pregunta-respuesta sobre asesoramiento laboral en coreano, durante 4 épocas con una tasa de aprendizaje de 2e-4.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset (número de ejemplos, proporción de categorías, proceso de anotación), ni sobre si se aplicaron técnicas adicionales como RLHF, DPO o regularización. Tampoco se documenta la arquitectura interna del modelo base Qwen3.5-0.8B (número de capas, dimensión oculta, mecanismo de atención, tipo de tokenizador), más allá de su tamaño de 0,8 mil millones de parámetros. La librería declarada es `peft`, con dependencias de `transformers` y `trl`, lo que confirma el uso de las utilidades estándar de Hugging Face para el entrenamiento.

## Capacidades

- Generación de texto en coreano orientada a preguntas y respuestas sobre normativa laboral.
- Especialización en un dominio concreto (asesoramiento laboral) gracias al ajuste fino supervisado sobre el dataset `labor-counsel-qa`.
- Capacidad de conversación multi-turno heredada del modelo base, aunque no documentada explícitamente para este adaptador.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al coreano según la etiqueta `language: ko`; no se documenta transferencia a otros idiomas.
- Modo thinking, visión o audio: no disponible (el modelo base es de texto y el adaptador no declara capacidades multimodales).
- Razonamiento matemático y generación de código: no documentado para este adaptador; dependería del modelo base.

## Casos de uso

- Asistente de consultas laborales para empleados: el adaptador puede responder preguntas frecuentes sobre derechos laborales, vacaciones, indemnizaciones o contratos en coreano, aprovechando el ajuste sobre el dataset de asesoramiento laboral. Es adecuado por su especialización vertical y su bajo coste de despliegue al ser un adaptador sobre un modelo de 0,8B.
- Primer nivel de atención en portales de recursos humanos: integrado en un chatbot que filtre consultas rutinarias de trabajadores antes de escalar a un asesor humano, reduciendo la carga del equipo legal.
- Generación de borradores de respuestas para gestorías laborales: el modelo puede producir textos preliminares que un profesional revisa y corrige, gracias a su entrenamiento sobre pares pregunta-respuesta del dominio.
- Herramienta interna de formación para departamentos de RR. HH.: servir como asistente de consulta rápida sobre normativa laboral coreana para personal no jurista, con la advertencia de que requiere validación humana.
- Prototipado rápido de asistentes especializados: al ser un adaptador LoRA de bajo rango, permite experimentar con especialización vertical sobre un modelo pequeño sin necesidad de GPUs de gran capacidad, facilitando iteraciones de bajo coste.
- Investigación sobre ajuste fino eficiente en dominios regulados: útil como caso de estudio de SFT con LoRA en un dominio jurídico-laboral y en un idioma de recursos medios como el coreano.
- Despliegue en entornos con recursos limitados: al combinarse con el modelo base de 0,8B, puede ejecutarse en GPUs de consumo o incluso en CPU con cuantización, aunque no se documentan los requisitos exactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa, un modelo base de 0,8B en precisión FP16 requiere aproximadamente 1,6 GB solo para los pesos, más overhead de activaciones y KV cache; el adaptador LoRA añade un coste marginal (decenas de MB).
- GPU recomendadas: no documentadas. Por el tamaño del modelo base, cabría en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, así como en A100/H100 para despliegues por lotes.
- ¿Cabe en consumer GPU? Sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM en FP16, y en menos con cuantización de 8 o 4 bits (no documentada).
- Opciones de despliegue: `peft` + `transformers` (carga mediante `PeftModel.from_pretrained`), y potencialmente vLLM, TGI o llama.cpp si se fusiona el adaptador con el modelo base y se convierte a los formatos soportados (no documentado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| yujin-ai26/qwen3.5-0.8b-labor-lora | Adaptador sobre 0,8B | No disponible | Apache 2.0 | safetensors (PEFT) | Especializado en asesoramiento laboral en coreano |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | No disponible en la informacion | safetensors | Modelo generalista sin especialización |
| Alternativas de dominio laboral en coreano | No disponible | No disponible | No disponible | No disponible | No se han identificado adaptadores comparables en la información disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría (adaptadores LoRA especializados en dominio laboral o modelos de 0,8B en coreano). La comparación se limita a la relación con el modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre un dataset específico de asesoramiento laboral coreano, puede heredar sesgos presentes en dicho corpus y en el modelo base.
- Riesgo de alucinación: elevado en un dominio jurídico-regulado; el modelo puede generar respuestas plausibles pero incorrectas sobre normativa laboral, por lo que requiere validación por profesionales.
- Limitaciones de contexto e idioma: el adaptador declara únicamente coreano (`ko`); no se garantiza un rendimiento adecuado en otros idiomas. La longitud de contexto efectiva depende del modelo base y no está documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-0.8B, que no se detalla en la información proporcionada.
- Caveats para producción: la model card es mínima y no documenta evaluación, métricas de calidad, composición del dataset ni procedimiento de entrenamiento reproducible; la adopción es muy baja (14 descargas, 0 likes) y no hay evidencia de validación independiente.
- El adaptador no es un modelo autónomo: requiere cargar el modelo base `Qwen/Qwen3.5-0.8B` y la librería `peft`, lo que añade dependencias y complejidad de despliegue.
- No se documentan medidas de seguridad, filtrado de contenido ni alineación específica para el dominio laboral.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/yujin-ai26/qwen3.5-0.8b-labor-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/yujin-ai26/labor-counsel-qa
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
