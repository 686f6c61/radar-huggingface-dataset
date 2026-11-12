# ssunzoon/sgb-models

## Resumen

`sgb-models` es una colección de modelos ajustados con LoRA y publicados en formato GGUF por el usuario ssunzoon, orientada a la redacción asistida de informes escolares en coreano. En concreto, el modelo genera frases en estilo nominal (명사형 문장) para el *생활기록부* (registro de vida escolar) de alumnos de educación primaria en Corea del Sur, cubriendo áreas como observaciones de conducta, evaluación por asignatura, autonomía, clubes, orientación vocacional, voluntariado, deporte escolar y tutoría.

El repositorio incluye dos variantes según el modelo base: `sgb-e2b-Q4_K_M.gguf`, derivada de `google/gemma-4-E2B-it` (unos 3,3 GB), y `sgb-1b-Q4_K_M.gguf`, derivada de `google/gemma-3-1b-it` (unos 0,8 GB). Ambas se distribuyen cuantizadas en Q4_K_M para inferencia local en equipos de consumo, con requisitos declarados de 16 GB de RAM (o GPU) para la variante grande y 8 GB sin GPU para la pequeña. El dato de parámetros en safetensors del repo (999.885.952) corresponde a la variante de 1B.

La relevancia del proyecto es acotada y muy específica: se trata de un ajuste educativo de nicho, monolingüe (coreano), con cero descargas y cero likes en el momento de la consulta, y sin benchmarks publicados. Su interés técnico reside en mostrar un flujo de trabajo LoRA + GGUF sobre modelos Gemma pequeños para una tarea administrativa concreta, no en capacidades generales de razonamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de los modelos base Gemma 3 1B y Gemma 4 E2B); no se detalla en la model card |
| Parámetros totales | 999.885.952 (dato de safetensors, corresponde a la variante 1B); la variante E2B no reporta cifra exacta |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | coreano (ko) |
| Licencia | `sgb-e2b`: Apache License 2.0; `sgb-1b`: Gemma Terms of Use (con política de usos prohibidos de Gemma) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de dos bases distintas de Google: `google/gemma-3-1b-it` y `google/gemma-4-E2B-it`, ambas variantes instructivas de la familia Gemma. Sobre ellas se aplicó un ajuste LoRA (según la model card) para la tarea de generación de frases nominales en coreano a partir de una entrada con formato `[영역/과목/약 N자] 키워드1, 키워드2, ...`, es decir, área o asignatura, longitud aproximada deseada y una lista de palabras clave.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado. La model card indica explícitamente que no se emplearon registros escolares reales con datos personales de alumnos en el entrenamiento. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá del propio ajuste LoRA y la conversión a GGUF para inferencia local.

## Capacidades

- Generación de texto en coreano con estilo administrativo y nominal, adaptado a las categorías del registro escolar surcoreano.
- Plantillas de entrada específicas por área: observaciones de conducta (행발), evaluación por asignatura (교과세특), autonomía (자율), clubes (동아리), orientación vocacional (진로), voluntariado (봉사), deporte escolar (스포츠클럽) y tutoría (학생상담).
- Control aproximado de longitud de la salida mediante la indicación `약 N자` en la entrada.
- Conversación básica heredada de los modelos instructivos base (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servicio.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Redacción de borradores de observaciones de conducta: el profesor introduce palabras clave sobre actitudes del alumno (`[행발/약 100자] 책임감 강함, 맡은 역할 끝까지 수행`) y el modelo devuelve una frase nominal que el docente revisa y ajusta.
- Evaluación por asignatura: generación de comentarios sintéticos por materia a partir de descriptores de desempeño, útil para acelerar el trabajo administrativo de fin de trimestre.
- Registro de actividades extracurriculares: descripción de participación en clubes, voluntariado o deporte escolar a partir de una lista de hechos y logros.
- Orientación vocacional: borradores de comentarios sobre intereses y aptitudes del alumno, siempre sujetos a validación del orientador.
- Tutoría y seguimiento: generación de notas de contexto para reuniones con familias, con la advertencia explícita de la model card de que el modelo puede malinterpretar situaciones delicadas.
- Despliegue local en centros educativos: la variante 1B en Q4_K_M (unos 0,8 GB) permite ejecución en equipos sin GPU con 8 GB de RAM, lo que facilita su uso en portátiles de profesorado sin infraestructura dedicada.
- Prototipado de asistentes administrativos educativos: sirve como referencia para equipos que quieran replicar el flujo LoRA + GGUF sobre modelos Gemma pequeños en otras lenguas o dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: variante E2B en Q4_K_M, aproximadamente 3,3 GB de pesos; variante 1B en Q4_K_M, aproximadamente 0,8 GB. La model card recomienda 16 GB de RAM (o GPU) para la primera y 8 GB de RAM sin GPU para la segunda.
- GPU recomendadas: no se especifican modelos concretos; por tamaño, cualquier GPU consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) puede alojar ambas variantes con margen.
- Cabe en GPU de consumo: sí, ambas variantes, incluidas GPUs de gama media y baja.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; el tag `endpoints_compatible` sugiere compatibilidad con servicios de inferencia tipo endpoint, aunque no se detalla el stack exacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| sgb-1b (este repo) | ~1,0 B | no disponible | ko | Gemma Terms of Use | GGUF Q4_K_M | Ajuste LoRA para informes escolares |
| sgb-e2b (este repo) | no disponible | no disponible | ko | Apache 2.0 | GGUF Q4_K_M | Ajuste LoRA sobre Gemma 4 E2B |
| google/gemma-3-1b-it | ~1 B | no disponible en esta ficha | multilingüe | Gemma Terms of Use | safetensors, GGUF | Modelo base instructivo generalista |
| google/gemma-4-E2B-it | no disponible | no disponible | multilingüe | Apache 2.0 | safetensors | Modelo base instructivo generalista |

La comparación relevante es contra los propios modelos base: `sgb-models` no aporta capacidades generales nuevas, sino una especialización estrecha en coreano para una tarea administrativa concreta, a costa de perder generalidad y multilingüismo.

## Limitaciones y advertencias

- Modelo de nicho monolingüe (coreano); no se ha validado su comportamiento en castellano ni en otras lenguas.
- Riesgo elevado de alucinación en contextos sensibles: la propia model card advierte de que las notas de tutoría pueden malinterpretar situaciones del alumno.
- Requiere revisión humana obligatoria: las frases generadas deben ser verificadas por el docente en cuanto a hechos y expresión antes de incorporarse a un registro oficial.
- Sin benchmarks publicados, sin descargas ni validación comunitaria en el momento de la consulta; madurez y robustez no verificadas.
- Licencia heterogénea: la variante 1B queda sujeta a los Gemma Terms of Use y a la política de usos prohibidos de Gemma, lo que condiciona el uso comercial; la variante E2B se declara bajo Apache 2.0.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con entradas largas.
- El dato de parámetros disponible (999.885.952) corresponde solo a la variante 1B; no hay cifra verificable para la variante E2B.
- Fecha de creación del repositorio (2026-11-12) posterior a la de esta ficha en algunos entornos; conviene verificar la vigencia de los enlaces y artefactos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ssunzoon/sgb-models
- Modelo base Gemma 3 1B instructivo: https://huggingface.co/google/gemma-3-1b-it
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
