# SupraLabs/Supra2.5-Pro-Instruct

## Resumen

Supra2.5-Pro Instruct es un modelo de lenguaje instructivo de muy pequeño tamaño (67 millones de parámetros) desarrollado por SupraLabs. Se trata de la versión afinada para instrucciones del modelo base Supra2.5-Pro-Base, y está pensado para inferencia local de chat en entornos con recursos muy limitados. La model card lo presenta explícitamente como un modelo "ultra-efficient" de 65M de parámetros (el dato real de safetensors es de 67.028.096 parámetros), etiquetado como "small" y "tiny" dentro del ecosistema de la familia Supra.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y versiones GGUF en F16, Q8_0 y Q4_K_M, y declara soporte únicamente para inglés. Su relevancia radica en su huella mínima: el repositorio completo ocupa unos 0,5 GB, lo que permite ejecutarlo en hardware de consumo muy modesto, incluso en CPU. Está etiquetado con `qwen3`, lo que sugiere que su arquitectura deriva de la familia Qwen3, aunque la model card no detalla la arquitectura interna.

Es importante señalar que el autor advierte de que el modelo no ha sido alineado en seguridad ni optimizado por preferencias, por lo que requiere un filtro de seguridad externo antes de exponerlo a usuarios finales. Las pruebas cualitativas incluidas en la propia model card muestran errores factuales graves (confusión de nombres, invención de dispositivos y premios), lo que sitúa al modelo en la categoría de experimentación y prototipado más que en producción crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3 según etiquetas; detalles no disponibles) |
| Parametros totales | 67.028.096 (≈67M) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (GGUF); safetensors en precisión original no especificada |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de la etiqueta `qwen3`, que apunta a una arquitectura transformer derivada de la familia Qwen3. No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni la longitud de contexto nativa. Tampoco se indica el número total de tokens de preentrenamiento del modelo base.

El ajuste instructivo se realizó durante 2 épocas sobre aproximadamente 9.000 conversaciones generadas sintéticamente por DeepSeek V4.1 Flash 1017 (modo no razonador, vía API de DeepSeek). Una parte importante de las instrucciones de origen proviene de SmolTalk2. El autor indica explícitamente que el modelo no fue alineado en seguridad ni optimizado mediante preferencias (sin RLHF/DPO declarado). La plantilla de chat es ChatML básica, la misma que la de Supra2-Medium-Instruct.

## Capacidades

- Generación de texto conversacional en inglés para diálogos cotidianos.
- Chat básico multi-turno con plantilla ChatML.
- Capacidades básicas de código y matemáticas, según declara el autor.
- Conversaciones de uso general ("everyday conversations").
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara modo thinking, visión ni audio.
- Multilingüismo limitado al inglés.

## Casos de uso

- Prototipado de chatbots locales: permite montar un asistente conversacional mínimo en un portátil o una Raspberry Pi, ya que el modelo completo cabe en menos de 1 GB en Q4_K_M.
- Pruebas de pipelines de inferencia: útil para validar integraciones con llama.cpp, Ollama o TGI antes de escalar a modelos mayores, gracias a su reducido tiempo de carga.
- Generación de texto offline en dispositivos embebidos: al no requerir GPU, puede desplegarse en entornos sin conectividad ni aceleradores.
- Educación y experimentación: sirve para estudiar el comportamiento de modelos instructivos pequeños y comparar técnicas de ajuste con datasets sintéticos.
- Filtrado y clasificación de texto simple: con prompts adecuados puede emplearse en tareas de etiquetado ligero o resumen de frases cortas, siempre con validación humana.
- Demos y entornos de pruebas de CI: su tamaño permite incluirlo en tests automatizados que verifiquen el correcto funcionamiento de una cadena de inferencia sin coste de GPU.
- Base para fine-tuning propio: al ser Apache 2.0 y tener pesos abiertos, puede servir como punto de partida para ajustes específicos de dominio con recursos mínimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M, aproximadamente 0,1-0,2 GB de pesos; en F16, alrededor de 0,15 GB. El repositorio completo ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también funciona en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1050, RTX 3050, RTX 4090, etc.) y en iGPU con memoria compartida.
- Opciones de despliegue: transformers, llama.cpp (GGUF), Ollama, text-generation-inference (el modelo está etiquetado como compatible con TGI y endpoints).
- Latencia y throughput estimados: no disponibles; por el tamaño, se espera baja latencia en CPU y muy alta en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Supra2.5-Pro Instruct | ≈67M | no disponible | Apache 2.0 | en | HF (safetensors, GGUF) |
| Qwen3 (variantes pequeñas) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| SmolLM2 (variantes pequeñas) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No ha sido alineado en seguridad ni optimizado por preferencias: puede generar contenido inapropiado, ofensivo o peligroso; requiere un filtro de seguridad externo.
- Alto riesgo de alucinación factual: los ejemplos de la propia model card contienen errores graves (confusión de Albert Einstein con "Albert Einthoven", invención de un "Einstein telescope" y atribución errónea del Nobel).
- Contexto limitado o no documentado: no se especifica la longitud de contexto, lo que dificulta planificar conversaciones largas.
- Solo inglés: no se declara soporte de castellano ni de otros idiomas.
- Capacidades limitadas: el propio autor lo restringe a chat básico, código y matemáticas elementales.
- No apto para producción crítica sin validación humana y sin capa de moderación.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre exactitud ni seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SupraLabs/Supra2.5-Pro-Instruct
- Modelo base: https://huggingface.co/SupraLabs/Supra2.5-Pro-Base
- Dataset de prompts de referencia: SmolTalk2 (no se proporciona enlace directo en la información disponible)
