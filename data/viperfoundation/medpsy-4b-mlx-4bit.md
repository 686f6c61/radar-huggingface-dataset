# viperfoundation/MedPsy-4B-MLX-4bit

## Resumen

MedPsy-4B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo qvac/MedPsy-4B, desarrollado originalmente por Tether AI Research (QVAC) y convertido por viperfoundation para su uso en dispositivo dentro de Viper Messenger. Se trata de un modelo de lenguaje de 4.022.468.096 parámetros (aproximadamente 4B) orientado al dominio médico, construido sobre la arquitectura Qwen3 según las etiquetas del repositorio, y pensado para inferencia local en hardware Apple Silicon mediante la librería MLX.

El modelo resuelve el problema de desplegar un asistente conversacional de temática sanitaria en entornos sin conectividad o con requisitos de privacidad estrictos, ya que el peso del repositorio es de 2,3 GB y la cuantización de 4 bits con grupo de 64 reduce drásticamente los requisitos de memoria frente al modelo original en precisión completa. La conversión se realizó con `mlx_lm.convert -q --q-bits 4 --q-group-size 64` y, según la model card, no se modificaron los pesos más allá de la cuantización.

Es relevante ahora porque ejemplifica la tendencia de llevar modelos especializados de dominio (en este caso, médico) a dispositivos de consumo mediante cuantización agresiva, manteniendo la licencia Apache 2.0 del modelo original. No obstante, el modelo está limitado al inglés, solo procesa texto y sus autores originales advierten explícitamente de que no sustituye el juicio clínico profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, familia Qwen3 (según tags del repositorio) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (MLX) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3`, que sitúa el modelo base en la familia Qwen3 de transformers decoder-only. El repositorio es una conversión cuantizada del modelo qvac/MedPsy-4B: los pesos originales se transformaron a 4 bits con group size 64 mediante `mlx_lm.convert`, sin cambios adicionales en los parámetros. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo original.

La model card indica que parte de los datos de entrenamiento originales están bajo licencia CC-BY-NC 4.0, lo que constituye una advertencia relevante para uso comercial pese a que la licencia declarada del modelo sea Apache 2.0. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal en la información proporcionada.

## Capacidades

- Generación de texto en inglés orientada al dominio médico y sanitario.
- Conversación multi-turno: el modelo está diseñado como asistente conversacional para Viper Messenger.
- Inferencia en dispositivo: la cuantización MLX 4-bit permite ejecución local en hardware Apple Silicon.
- Procesamiento exclusivamente de texto: no se declaran capacidades de visión, audio ni multimodalidad.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Asistente médico conversacional en dispositivo: el modelo puede mantener diálogos multi-turno sobre temas de salud ejecutándose localmente en un Mac con Apple Silicon, lo que evita enviar datos clínicos a servidores externos y preserva la privacidad del usuario.
- Aplicaciones de mensajería con asistencia sanitaria integrada: es precisamente el escenario para el que se creó la conversión, dentro de Viper Messenger, donde el modelo responde a consultas de salud sin requerir conectividad.
- Educación y divulgación sanitaria: puede explicar conceptos médicos básicos en inglés a estudiantes o pacientes, siempre con los avisos visibles de que las respuestas son generadas por IA y no sustituyen el consejo profesional.
- Prototipado rápido de asistentes clínicos: investigadores pueden desplegar el modelo en un portátil Apple para evaluar flujos conversacionales antes de escalar a infraestructura mayor, gracias a sus 2,3 GB de pesos.
- Triaje informativo no crítico: el modelo puede orientar al usuario sobre qué tipo de profesional consultar ante síntomas descritos en texto, con la advertencia explícita de que nunca debe usarse en emergencias.
- Investigación sobre cuantización en dominio médico: sirve como caso de estudio para medir la degradación de calidad de un modelo especializado de 4B al pasar a 4 bits con group size 64 en MLX.
- Aplicaciones offline en entornos con conectividad limitada: clínicas rurales o entornos aislados donde se necesite un asistente de consulta textual en inglés sin acceso a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 2,3 GB para los pesos en 4 bits, más overhead de activaciones y KV cache; un entorno con 8 GB de memoria unificada es suficiente para contextos moderados.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4) por el uso de la librería MLX; no es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada; no está pensado para GPUs NVIDIA.
- Opciones de despliegue: `mlx_lm` (generación y servidor), integración en aplicaciones nativas mediante MLX; no se documenta soporte de vLLM, llama.cpp ni Ollama para este repositorio concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MedPsy-4B-MLX-4bit | 4,02B | no disponible | Apache 2.0 (datos parciales CC-BY-NC 4.0) | safetensors MLX 4-bit | Especializado en dominio médico, solo inglés, on-device |
| qvac/MedPsy-4B (original) | 4,02B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar; mayor precisión, mayor huella de memoria |
| Otros asistentes médicos de ~4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es sustituto de un médico: los autores originales advierten que nunca debe usarse en emergencias y que puede dar respuestas erróneas o incompletas.
- Riesgo de alucinación: al ser un modelo de 4B cuantizado a 4 bits, la probabilidad de generar información médica incorrecta es significativa; la cuantización puede degradar aún más la precisión respecto al modelo original.
- Solo inglés y solo texto: no soporta otros idiomas ni entradas multimodales.
- No es una herramienta de salud mental ni de terapia, según la model card original.
- Licencia: aunque se declara Apache 2.0, parte de los datos de entrenamiento originales están bajo CC-BY-NC 4.0, lo que introduce incertidumbre sobre el uso comercial.
- Obligación de avisos: debe mostrarse siempre un descargo de responsabilidad visible indicando que las salidas son generadas por IA y no sustituyen el consejo médico profesional.
- Sesgos: no se documentan sesgos específicos en la información disponible, pero un modelo entrenado principalmente en inglés puede reflejar sesgos de la población y literatura médica anglosajona.
- Contexto: se desconoce la longitud máxima de contexto, lo que limita la planificación de despliegues con documentos largos.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin evidencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/viperfoundation/MedPsy-4B-MLX-4bit
- Modelo base: https://huggingface.co/qvac/MedPsy-4B
- Librería MLX: https://github.com/ml-explore/mlx
- Herramienta de conversión mlx_lm: https://github.com/ml-explore/mlx-lm
