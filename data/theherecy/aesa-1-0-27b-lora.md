# TheHerecy/Aesa-1.0-27B-LoRA

## Resumen

Aesa 1.0 27B LoRA es un adaptador PEFT de tipo LoRA (entrenado con QLoRA) publicado por el usuario TheHerecy sobre el modelo base `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, una variante "abliterated" de la familia Qwen 3.8 de 27B parámetros. El adaptador está pensado como un copiloto de estilo Hermes orientado a pruebas de penetración autorizadas, con un énfasis explícito en evitar la fabricación de datos por parte del modelo. El repositorio contiene únicamente los pesos del adaptador (1,8 GB), no el modelo completo.

El entrenamiento se realizó con Axolotl 0.21.2.dev0 y PEFT 0.21.2 en configuración QLoRA de 4 bits, con rango 64, alpha 128 y dropout 0,05. Se aplicaron 156 pasos (aproximadamente 3 épocas) sobre secuencias empaquetadas de 16K tokens, con batch efectivo de 16 y tasa de aprendizaje 2e-4, empleando una única GPU H100 de 80 GB. El autor reporta una `train_loss` aproximada de 6,9.

Su relevancia es acotada: se trata de un adaptador de nicho, sin descargas ni interacciones en el momento de la consulta, orientado a un caso de uso muy específico (seguridad ofensiva autorizada). Resulta útil como ejemplo de ajuste fino eficiente sobre un modelo de 27B con recursos moderados y como base para experimentación en dominios de seguridad, pero no debe considerarse un modelo generalista listo para producción sin evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen 3.8 de 27B; arquitectura base etiquetada como `qwen3_5`, con atención lineal (`linear_attn`) en la torre de texto |
| Parametros totales | No disponible para el adaptador; el modelo base es de 27B (según nomenclatura) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (entrenado con secuencias empaquetadas de 16K) |
| Tipos de cuantizacion | Entrenado en QLoRA 4-bit (bitsandbytes); se anuncia una versión GGUF en `TheHerecy/Aesa-1.0-27B-GGUF` (tipos concretos no disponibles) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | `adapter_model.safetensors` (PEFT); pesos fusionados y GGUF publicados en repos separados |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer de la familia Qwen 3.8 de 27B parámetros en su variante "abliterated", que elimina los mecanismos de rechazo del modelo original. Los módulos objetivo del LoRA (solo en la torre de texto) incluyen `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, así como `linear_attn.in_proj_qkv`, `linear_attn.in_proj_z` y `linear_attn.out_proj`, lo que confirma la presencia de capas de atención lineal en la arquitectura base. La configuración LoRA es r=64, alpha=128 y dropout=0,05.

El entrenamiento se llevó a cabo con Axolotl 0.21.2.dev0 y PEFT 0.21.2 en modo QLoRA de 4 bits, durante 156 pasos (unas 3 épocas), con secuencias empaquetadas de 16K, batch efectivo de 16, learning rate 2e-4 y una sola H100 de 80 GB. La pérdida de entrenamiento reportada es de aproximadamente 6,9. No se documentan en la información disponible detalles sobre la composición del dataset, el volumen de tokens, ni si hubo etapas de RLHF o DPO. El autor describe el objetivo como un copiloto de estilo Hermes "anti-fabricación" para pruebas de penetración autorizadas.

## Capacidades

- Generación de texto y conversación multi-turno en el pipeline `text-generation`.
- Asistencia en tareas de seguridad ofensiva autorizada (reconocimiento, explotación, post-explotación) según la descripción del autor.
- Orientación explícita a reducir la fabricación de información ("anti-fabricación"), aunque no se aportan métricas que lo cuantifiquen.
- Herencia de las capacidades del modelo base Qwen 3.8 27B (razonamiento, código, matemáticas), si bien no se detallan en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking", visión o audio: no disponible en la información proporcionada (los targets del LoRA se limitan a la torre de texto).

## Casos de uso

- Pruebas de penetración autorizadas: el adaptador puede emplearse como asistente conversacional para planificar fases de reconocimiento, enumeración y explotación en entornos de laboratorio o con permiso escrito, aprovechando el ajuste específico del dominio.
- Redacción de informes de seguridad: generación de hallazgos, descripciones de vulnerabilidades y recomendaciones de mitigación a partir de notas de una auditoría, con el sesgo anti-fabricación como ayuda para no inventar CVE o evidencias.
- Formación y laboratorios de ciberseguridad: uso en entornos controlados (CTFs, rangos de entrenamiento) para explicar técnicas y construir cadenas de ataque paso a paso.
- Automatización de triaje de alertas: integración en un pipeline que resuma y clasifique alertas de un SIEM, con el modelo como capa de lenguaje sobre datos estructurados.
- Experimentación en ajuste fino: sirve como referencia reproducible de QLoRA sobre un modelo de 27B con una sola H100, útil para equipos que quieran replicar la receta con sus propios datos.
- Investigación sobre alineación y rechazo: al partir de una variante "abliterated", permite estudiar el comportamiento del modelo sin mecanismos de rechazo y compararlo con la versión original en tareas de evaluación de seguridad.
- Despliegue local con GGUF: la existencia de una versión GGUF permite probar el modelo fusionado en estaciones de trabajo con llama.cpp u Ollama para tareas de asistencia offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: el autor reporta una única GPU H100 de 80 GB para el QLoRA de 4 bits con secuencias empaquetadas de 16K y batch efectivo 16.
- Inferencia con el adaptador: requiere cargar el modelo base de 27B en 4 bits (QLoRA) o en cuantizaciones inferiores; el adaptador por sí solo ocupa 1,8 GB.
- VRAM estimada: no disponible de forma explícita; para un modelo de 27B en 4 bits cabe esperar del orden de 16-20 GB de pesos más overhead de contexto y activaciones, aunque esta cifra no está confirmada en la información proporcionada.
- GPU recomendadas: H100 o A100 para el modelo base en precisión completa o BF16; RTX 4090 (24 GB) o superiores para cuantizaciones de 4 bits.
- ¿Cabe en GPU de consumo? Probablemente en 4 bits en GPUs de 24 GB, pero no está verificado en la información disponible.
- Opciones de despliegue: PEFT + Transformers para el adaptador; llama.cpp u Ollama para la versión GGUF; vLLM o TGI para el modelo fusionado (no confirmado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aesa 1.0 27B LoRA | 27B (base) + adaptador LoRA | No disponible | Copiloto de pentesting | Apache-2.0 | Hugging Face (adaptador, fusionado y GGUF) |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | No disponible | Base generalista sin rechazo | Apache-2.0 (según base) | Hugging Face |
| Qwen 3.8 27B (original) | 27B | No disponible | Modelo generalista | No disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se entrenó sobre una variante "abliterated", por lo que carece de los mecanismos de rechazo del modelo original; puede producir contenido sensible sin filtros.
- La `train_loss` reportada (~6,9) es alta y el número de pasos es reducido (156), lo que sugiere un ajuste limitado y posible sobreajuste o infraajuste; no hay evaluación cuantitativa publicada.
- El `adapter_config.json` apunta a una ruta local de entrenamiento como `base_model_name_or_path`; es necesario cargarlo explícitamente contra `huihui-ai/Huihui-Qwen3.8-27B-abliterated`.
- Riesgo de alucinación: aunque el autor declara un enfoque anti-fabricación, no se aportan métricas que lo respalden; en dominios de seguridad, una alucinación puede ser especialmente peligrosa (CVE inventados, comandos incorrectos).
- Uso previsto restringido a sistemas con autorización explícita; el uso ofensivo no autorizado puede ser ilegal.
- Sin datos sobre idiomas soportados, sesgos conocidos ni comportamiento multilingüe.
- Licencia Apache-2.0 heredada del base, lo que permite uso comercial, pero el autor no ofrece garantías sobre el adaptador.
- Repositorio sin descargas ni interacciones en el momento de la consulta: no hay validación comunitaria ni informes independientes.

## Enlaces

- Adaptador LoRA: https://huggingface.co/TheHerecy/Aesa-1.0-27B-LoRA
- Pesos fusionados: https://huggingface.co/TheHerecy/Aesa-1.0-27B
- Versión GGUF: https://huggingface.co/TheHerecy/Aesa-1.0-27B-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
