# trangthanhdai/Zenith-0.5B

## Resumen

Zenith VN 0.5B es un modelo de lenguaje causal de tipo conversacional desarrollado por el usuario de Hugging Face trangthanhdai (bajo el nombre de proyecto udVietNamspeedrace). Se trata de un ajuste fino (fine-tuning) mediante LoRA del modelo base Qwen1.5-0.5B-Chat, orientado a proporcionar un asistente ligero para usuarios vietnamitas. El modelo hereda la arquitectura Qwen1 del modelo original y cuenta con aproximadamente 464 millones de parámetros reales según los pesos en safetensors.

El objetivo declarado del proyecto es ofrecer una base para el desarrollo de IA conversacional en vietnamita, cubriendo comprensión y respuesta en conversaciones, conocimiento general, asistencia en temas de tecnología y programación, y autoidentificación como "Zenith VN". Es un proyecto experimental, con un volumen de descargas muy bajo (73 descargas y 1 like en el momento de la consulta) y sin resultados de benchmarks publicados.

Por su tamaño reducido y su naturaleza derivada de Qwen1.5-0.5B-Chat, el modelo es relevante principalmente como ejemplo de adaptación lingüística de bajo coste y como base para experimentación, no como un modelo de producción de alto rendimiento. La licencia no está declarada explícitamente en la ficha, lo que constituye una limitación importante para su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen1 (transformer causal decoder-only), con posible código custom (`configuration_zenith.py`, `modeling_zenith.py`) |
| Parametros totales | 463.987.712 (aprox. 0,5 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen1.5-0.5B-Chat; no confirmada en la ficha) |
| Tipos de cuantizacion | Entrenamiento en 4-bit QLoRA; pesos exportados en safetensors (FP16/BF16 presumiblemente); no se listan cuantizaciones GGUF/AWQ/GPTQ |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | no disponible (derivada de Qwen1.5-0.5B-Chat; debe respetarse la licencia original) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen1 de Qwen1.5-0.5B-Chat, un transformer causal decoder-only de aproximadamente 0,5 mil millones de parámetros. Sobre esta base se aplicó un ajuste fino supervisado (SFT) con LoRA, utilizando cuantización de 4 bits (QLoRA) durante el entrenamiento. El proceso descrito en la model card incluye: carga del modelo preentrenado, preparación de datasets conversacionales en vietnamita, cuantización 4-bit, configuración de adaptadores LoRA, SFT, fusión de los pesos LoRA en el modelo base y exportación final en safetensors.

Las herramientas empleadas fueron Python, PyTorch, Hugging Face Transformers, PEFT, TRL, Datasets, Accelerate y BitsAndBytes. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La presencia de archivos `configuration_zenith.py` y `modeling_zenith.py` en la estructura esperada del repositorio sugiere la posibilidad de código de arquitectura personalizado, aunque la model card indica que los archivos reales pueden diferir.

## Capacidades

- Generación de texto conversacional en vietnamita e inglés.
- Respuesta a preguntas de conocimiento general.
- Asistencia en temas de tecnología y programación (según declaración del autor).
- Autoidentificación como "Zenith VN".
- Soporte de plantilla de chat mediante `apply_chat_template` con roles de usuario/asistente.
- No se documenta soporte de tool calling o function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada a vietnamita e inglés según los tags.

## Casos de uso

- Asistente conversacional en vietnamita para prototipos: el modelo puede gestionar diálogos multi-turno básicos mediante su plantilla de chat, adecuado para experimentar con interfaces de chat ligeras en entornos de desarrollo.
- Base para fine-tuning adicional en vietnamita: al ser un modelo pequeño derivado de Qwen1.5-0.5B-Chat, sirve como punto de partida para experimentos de adaptación lingüística con LoRA en hardware modesto.
- Respuesta a preguntas frecuentes en vietnamita: puede emplearse en demos de atención al cliente de baja complejidad, siempre con revisión humana y sin garantías de precisión.
- Asistencia básica en programación: el autor declara soporte para temas de tecnología y programación, útil para entornos educativos o de prueba, no para producción crítica.
- Investigación sobre ajuste fino eficiente: su pipeline QLoRA + LoRA + fusión de pesos documentado lo convierte en un caso de estudio reproducible para quienes aprenden PEFT.
- Experimentación con código custom de Transformers: la posible presencia de `modeling_zenith.py` permite estudiar la carga de arquitecturas personalizadas con `trust_remote_code`, siempre tras revisar el código.
- Despliegue en CPU o GPU de gama baja para pruebas: con ~0,5B parámetros, es viable para demos locales, aunque el autor no proporciona cifras de latencia ni throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para los pesos (0,46B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, alrededor de 1,5-2 GB según longitud de secuencia.
- VRAM estimada en 4-bit: aproximadamente 0,3-0,5 GB para pesos, más overhead; viable en GPUs de gama baja.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problemas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con al menos 2-4 GB de VRAM en FP16, y en GPUs integradas o CPU con cuantización.
- Opciones de despliegue: Transformers (documentado en la model card); vLLM, llama.cpp, Ollama y TGI no están documentados ni se confirma compatibilidad (no hay pesos GGUF publicados).
- Latencia y throughput: no disponibles; el autor no proporciona cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Zenith VN 0.5B | ~0,46B | no disponible | vi, en | no disponible | safetensors | Fine-tuning LoRA de Qwen1.5-0.5B-Chat; experimental |
| Qwen1.5-0.5B-Chat | ~0,5B | 32K (según documentación oficial de Qwen, no confirmado en esta ficha) | multilingüe | Apache 2.0 (según modelo original) | safetensors | Modelo base; mayor cobertura multilingüe y licencia clara |
| Qwen2.5-0.5B-Instruct | ~0,5B | 32K (según documentación oficial, no confirmado aquí) | multilingüe | Apache 2.0 (según modelo original) | safetensors, GGUF | Generación posterior de Qwen; mejor soporte de ecosistema |
| SmolLM2-360M-Instruct | ~0,36B | 8K (según documentación oficial, no confirmado aquí) | principalmente inglés | Apache 2.0 | safetensors, GGUF | Alternativa pequeña orientada a inglés |

Nota: los datos de contexto y licencia de los modelos comparados provienen de conocimiento general y no de la información proporcionada en esta ficha; deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Modelo experimental: el propio autor advierte de capacidades de razonamiento limitadas y posible generación de información inexacta.
- Riesgo de alucinación: alta probabilidad en un modelo de 0,5B sin benchmarks publicados; no apto para asesoramiento profesional.
- Conocimiento limitado al modelo base y a los datos de entrenamiento no documentados.
- Comprensión incompleta de expresiones vietnamitas según el autor.
- Licencia no declarada explícitamente: la model card indica que debe respetarse la licencia de Qwen1.5-0.5B-Chat y confirmarse antes de distribuir; esto bloquea o condiciona el uso comercial hasta aclararse.
- Posible código custom (`modeling_zenith.py`): requiere revisión manual antes de usar `trust_remote_code=True` por riesgo de seguridad.
- Sin datos de benchmarks, contexto confirmado ni cifras de latencia: difícil evaluar su rendimiento frente a alternativas.
- Volumen de adopción muy bajo (73 descargas, 1 like): poca validación comunitaria.
- No se documentan cuantizaciones GGUF ni integración con vLLM/Ollama, lo que limita el despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trangthanhdai/Zenith-0.5B
- Perfil del autor: https://huggingface.co/trangthanhdai
- Modelo base Qwen1.5-0.5B-Chat: https://huggingface.co/Qwen/Qwen1.5-0.5B-Chat
