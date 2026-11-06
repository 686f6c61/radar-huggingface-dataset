# Tomopas/Kumo-1.5B

## Resumen

Kumo-1.5B es un modelo de lenguaje de 1.543.714.304 parámetros (aproximadamente 1,5B), desarrollado por Tomopas y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tuning de Qwen/Qwen2.5-Coder-1.5B-Instruct orientado específicamente a la depuración autónoma de código en múltiples pasos y a la generación de código Python. Su propuesta central es convertir un modelo de 1B en un agente de programación capaz de inspeccionar ficheros de un workspace, escribir parches, ejecutar tests en un sandbox e iterar hasta que las pruebas pasen.

El modelo emplea una arquitectura transformer de tipo Qwen2, heredada íntegramente de su base, sobre la que se aplica un protocolo de etiquetas propio (`<read>`, `<file>`, `<py>`, `<final>`, `<observation>`) sobre una única plantilla ChatML. Esto permite dos modos de uso con el mismo tokenizador: un modo agente multi-paso y un modo directo de generación de código en un solo turno.

Su relevancia actual reside en que demuestra que un modelo de 1,5B parámetros, mediante RFT (rejection fine-tuning) filtrado por ejecución real de tests y una interpolación de pesos WiSE-FT, puede superar ampliamente a su base en tareas de depuración agéntica (73,3% frente a 10,0% en el benchmark de tool-loop), manteniendo un rendimiento competitivo en HumanEval y MBPP. El modelo es de publicación reciente y cuenta con pocas descargas (24) y ningún like en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 (heredada de Qwen2.5-Coder-1.5B-Instruct) |
| Parámetros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible en la información proporcionada (pesos en safetensors; compatible con cuantización estándar de transformers, pero sin confirmación del autor) |
| Idiomas soportados | No disponible en la información proporcionada (la model card y los tags no declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 3,1 GB); librería transformers; existe un adaptador LoRA separado en Tomopas/Kumo-1.5B-LoRA |

## Arquitectura y entrenamiento

Kumo-1.5B es un modelo denso de arquitectura transformer Qwen2, sin modificaciones estructurales respecto a su base Qwen2.5-Coder-1.5B-Instruct. La innovación no está en la arquitectura sino en el proceso de ajuste y en el protocolo de interacción: un único template ChatML soporta tanto el modo directo como el modo agente, donde el modelo emite etiquetas (`<py>`, `<file>`, `<read>`, `<final>`) y recibe observaciones del entorno (`<observation>`).

El entrenamiento se articula en tres fases descritas por el autor. Primero, un muestreo de rechazo on-policy (RFT): se generan candidatos de soluciones y trazas agénticas multi-paso a partir del modelo base y se filtran estrictamente mediante ejecución de tests unitarios en sandbox. Segundo, un SFT denominado `sft_clean` en el que el 100% de las muestras son de asistente libre de bugs: el código defectuoso aparece únicamente en turnos `user` o `<observation>`, nunca en turnos `assistant`, para evitar que `assistant_only_loss` entrene al modelo a inyectar mutaciones de operadores en el primer turno. Tercero, una interpolación en espacio de pesos WiSE-FT con λ = 0,55: el adaptador LoRA de rango 32 se fusiona con el modelo base según W_kumo = W_base + 0,55 · ΔW_sft_clean, combinando la capacidad de síntesis algorítmica del base con el protocolo de tool-use aprendido. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de código Python en un solo turno (modo directo), incluyendo funciones completas y ejecutables en un bloque de código.
- Depuración autónoma multi-paso en un workspace: lectura de ficheros, escritura de parches, ejecución de código y verificación mediante tests.
- Protocolo de agente basado en etiquetas: `<read path="..."/>`, `<file path="...">...</file>`, `<py>...</py>`, `<final>...</final>`, con observaciones entrantes en `<observation>...</observation>`.
- Tool use / function calling implícito a través del protocolo de etiquetas y del bucle de observaciones del sandbox.
- Razonamiento iterativo multi-paso: el modelo insiste hasta que los tests pasan (media de 4,7 pasos en el benchmark de tool-loop).
- Corrección de bugs zero-shot: localización y reparación de código defectuoso a partir del código y el test fallido en un único prompt.
- Capacidades multilingües: no declaradas en la información disponible.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Reparación automática de tests en CI/CD: el modelo puede recibir un workspace con tests fallidos, inspeccionar los ficheros implicados con `<read>`, aplicar un parche con `<file>` y verificar la corrección ejecutando los tests con `<py>`, integrándose como paso de auto-fix en pipelines antes de abrir una pull request.
- Agente de depuración en entornos sandbox: al operar sobre un directorio de trabajo aislado y comunicarse mediante observaciones, encaja en plataformas de ejecución de código (contenedores efímeros) para resolver incidencias sin intervención humana.
- Asistente de programación en IDE con capacidad de inspección de ficheros: su protocolo `<read>`/`<file>` permite construir un copiloto que no solo sugiere código, sino que lee el contexto real del proyecto y propone parches aplicables.
- Generación de funciones Python para tareas algorítmicas: en modo directo produce soluciones completas en un bloque de código, útil para autocompletado de funciones, generación de utilidades y ejercicios de entrevista técnica.
- Corrección de bugs zero-shot en revisión de código: dado un fragmento defectuoso y un test que falla, el modelo propone una corrección en un solo turno, adecuado para herramientas de análisis estático que quieran sugerir fixes concretos.
- Automatización de tareas de mantenimiento de repositorios pequeños: actualización de firmas, migración de APIs o ajuste de tests en proyectos de tamaño moderado donde el contexto de 1,5B es suficiente y el coste de inferencia es bajo.
- Evaluación y experimentación en investigación sobre agentes: su receta reproducible (RFT + SFT limpio + WiSE-FT) y su tamaño reducido lo hacen útil como banco de pruebas de técnicas de entrenamiento agéntico.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (greedy `pass@1`, `temperature=0.0`):

| Modelo | HumanEval pass@1 (164) | MBPP pass@1 (374) | Bug-Fix zero-shot (60) | Agent tool-loop pass@1 (60) | Pasos medios de agente |
|---|---:|---:|---:|---:|---:|
| Qwen/Qwen2.5-Coder-1.5B-Instruct (base) | 69,5% | 55,9% | 56,7% | 10,0% | 2,4 |
| Kumo-1.5B | 66,5% | 58,3% | 71,7% | 73,3% | 4,7 |

El autor destaca una mejora de +63,3 puntos en depuración autónoma multi-paso (de 10,0% a 73,3%, resolviendo 44 de 60 workspaces con bugs en 4,7 pasos de media), +15,0 puntos en bug-fixing zero-shot (de 56,7% a 71,7%) y +2,4 puntos en MBPP (de 55,9% a 58,3%). HumanEval retrocede 3,0 puntos respecto al base (de 69,5% a 66,5%). El autor señala además que el modo agente multi-paso (73,3%) supera al prompting zero-shot con el código y el test fallido en un único prompt (71,7%). No se han publicado otros benchmarks (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia por tamaño, en bfloat16 los pesos ocupan aproximadamente 3,1 GB, por lo que se necesita algo más de 4 GB de VRAM contando caché de activaciones y contexto; en cuantización de 8 bits rondaría 1,6-2 GB y en 4 bits aproximadamente 1 GB, aunque el autor no confirma cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB de VRAM para bfloat16 (RTX 3060, RTX 4060, RTX 4070, RTX 4090). Para despliegue en servidor, A100 o H100 no son necesarias por tamaño, pero pueden usarse para servir muchas réplicas concurrentes.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño de 1,5B parámetros.
- Opciones de despliegue: transformers (soporte nativo, ejemplo incluido en la model card), text-generation-inference (tag `text-generation-inference` presente), endpoints compatibles (tag `endpoints_compatible`). No se confirma soporte explícito de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval pass@1 | MBPP pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kumo-1.5B | 1,54B | No disponible | 66,5% | 58,3% | Apache 2.0 | Hugging Face (Tomopas/Kumo-1.5B) |
| Qwen2.5-Coder-1.5B-Instruct | 1,54B | No disponible en esta ficha | 69,5% | 55,9% | Apache 2.0 | Hugging Face (Qwen) |
| Qwen2.5-Coder-7B-Instruct | 7B (aproximado) | No disponible en esta ficha | No disponible | No disponible | Apache 2.0 | Hugging Face (Qwen) |
| Otros modelos de 1-2B orientados a código | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación principal es con su propio modelo base: Kumo-1.5B sacrifica 3,0 puntos en HumanEval pero gana 2,4 en MBPP, 15,0 en bug-fixing zero-shot y 63,3 en depuración agéntica multi-paso. Frente a modelos de mayor tamaño como la familia Qwen2.5-Coder-7B, no hay datos de benchmarks en la información disponible para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está especializado en Python y en tareas de código; su rendimiento fuera de ese dominio no está documentado y probablemente sea inferior al de modelos generalistas del mismo tamaño.
- Retroceso de 3,0 puntos en HumanEval respecto al modelo base, lo que sugiere una ligera pérdida de capacidad en generación de código desde cero a cambio de mejorar en depuración agéntica.
- El modo agente depende de un protocolo de etiquetas concreto y de un entorno de ejecución en sandbox; un uso fuera de ese protocolo puede degradar el comportamiento.
- No se declaran idiomas soportados ni se han publicado evaluaciones multilingües; el soporte de castellano no está verificado.
- No se han publicado datos sobre sesgos, toxicidad o tasas de alucinación.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen2.5-Coder-1.5B-Instruct, también Apache 2.0, por lo que no hay restricciones adicionales conocidas más allá de las de la licencia base.
- Modelo con muy poca adopción (24 descargas, 0 likes) y sin validación externa independiente de los benchmarks reportados por el autor; los resultados deben tomarse como no replicados.
- No se especifican la longitud de contexto efectiva ni el número de tokens de entrenamiento, lo que limita la planificación de despliegues con contextos largos.
- En producción, la ejecución de código generado por el modelo requiere aislamiento estricto (sandbox, límites de recursos, sin acceso a red) para evitar riesgos de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tomopas/Kumo-1.5B
- Adaptador LoRA: https://huggingface.co/Tomopas/Kumo-1.5B-LoRA
- Perfil del autor: https://huggingface.co/Tomopas
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
