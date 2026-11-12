# ssunzoon/sgb-1b-GGUF

## Resumen

El modelo `ssunzoon/sgb-1b-GGUF` es un ajuste fino mediante LoRA del modelo base `google/gemma-3-1b-it` de Google, publicado por el usuario `ssunzoon` en formato GGUF. Su propósito es asistir al profesorado de educación primaria de Corea del Sur en la redacción de las anotaciones del *생활기록부* (registro escolar del alumno), un documento oficial que recoge observaciones sobre conducta, asignaturas, actividades autónomas, clubes, orientación vocacional, voluntariado, deporte escolar y tutoría. El modelo recibe una lista de palabras clave con el área y la longitud deseada y genera frases en estilo nominal en coreano.

Con 999.885.952 parámetros (aproximadamente 1.000 millones), el modelo es una variante compacta pensada para ejecutarse en equipos de sobremesa sin GPU dedicada: el archivo Q4_K_M ocupa unos 0,8 GB y requiere 8 GB de RAM. El repositorio incluye además una variante basada en `google/gemma-4-E2B-it` (archivo de 3,3 GB), aunque la ficha del modelo base en Hugging Face se corresponde con la variante de 1B.

La relevancia del modelo es acotada: se trata de un ajuste especializado, con cero descargas y cero *likes* en el momento de la consulta, orientado a un nicho administrativo muy concreto (el sistema educativo surcoreano) y con soporte exclusivo del idioma coreano. No obstante, ejemplifica bien el patrón de adaptación de modelos pequeños a tareas de generación de texto administrativo con restricciones de formato y estilo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 1B; detalles no disponibles) |
| Parametros totales | 999.885.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (única cuantización publicada) |
| Idiomas soportados | coreano (ko) |
| Licencia | Gemma Terms of Use (modelo base Gemma 3); uso sujeto a la política de usos prohibidos de Gemma |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de aproximadamente 1.000 millones de parámetros ajustado para instrucciones. Sobre esa base se aplicó un ajuste LoRA para especializarlo en la redacción de anotaciones del registro escolar coreano. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación adicionales como RLHF o DPO.

La innovación principal no es arquitectónica sino de formato: el modelo está entrenado para interpretar una cabecera estructurada `[영역/과목/약 N자]` (área/asignatura/longitud aproximada) seguida de palabras clave separadas por comas, y para producir frases en estilo nominal (*명사형*) adecuadas al registro administrativo. La model card indica explícitamente que no se utilizaron registros escolares reales con datos personales de alumnos en el entrenamiento.

## Capacidades

- Generación de texto administrativo en coreano con estilo nominal, adaptado a ocho áreas del registro escolar: conducta (행발), observaciones por asignatura (교과세특), actividades autónomas (자율), clubes (동아리), orientación vocacional (진로), voluntariado (봉사), deporte escolar (스포츠클럽) y tutoría (학생상담).
- Control de longitud aproximada mediante la cabecera `약 N자` (aproximadamente N caracteres).
- Transformación de listas de palabras clave en frases cohesionadas.
- Conversación multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad con *endpoints* de inferencia (etiqueta `endpoints_compatible`).
- No se documentan capacidades de *tool calling*, razonamiento multi-paso, visión, audio ni matemáticas avanzadas; el ajuste está orientado a una única tarea de generación.

## Casos de uso

- Redacción de observaciones de conducta: el profesor introduce `[행발/약 100자] 책임감 강함, 맡은 역할 끝까지 수행, 친구 배려` y obtiene un borrador de aproximadamente 100 caracteres que después revisa y edita.
- Observaciones por asignatura: para cada materia, el docente aporta evidencias de aprendizaje y el modelo genera el texto de la columna `교과세특` con el estilo requerido por el sistema.
- Actividades autónomas y clubes: a partir de las actividades realizadas por el alumno (por ejemplo, participación en un proyecto de ciencias), el modelo produce el párrafo correspondiente a `자율` o `동아리`.
- Orientación vocacional: el tutor enumera intereses y aptitudes del alumno y el modelo redacta el apartado de `진로` con la terminología habitual del registro.
- Voluntariado y deporte escolar: descripción de participación en actividades de servicio comunitario o en competiciones deportivas escolares a partir de palabras clave.
- Tutoría y seguimiento: generación de borradores para `학생상담`, con la advertencia de la model card de que el modelo puede malinterpretar la situación y el texto debe verificarse siempre.
- Despliegue en equipos modestos: al ocupar 0,8 GB en Q4_K_M y requerir 8 GB de RAM, puede ejecutarse en portátiles de centro educativo sin GPU dedicada mediante llama.cpp u Ollama, lo que facilita su uso por profesorado sin infraestructura técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo `sgb-1b-Q4_K_M.gguf` ocupa aproximadamente 0,8 GB; la model card recomienda un equipo con 8 GB de RAM y sin tarjeta gráfica dedicada.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer con 2 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050) puede alojar el modelo en Q4_K_M.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer actuales, e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el repositorio está marcado como `endpoints_compatible`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ssunzoon/sgb-1b-GGUF | 999.885.952 | no disponible | ko | Gemma Terms of Use | GGUF |
| google/gemma-3-1b-it (base) | ~1.000 millones | no disponible en la información | multilingüe | Gemma Terms of Use | safetensors, GGUF |
| ssunzoon/sgb-e2b (variante del mismo autor) | no disponible | no disponible | ko | Apache License 2.0 (según model card) | GGUF (~3,3 GB) |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con otros modelos especializados en redacción administrativa en coreano.

## Limitaciones y advertencias

- El modelo puede malinterpretar el contexto de una situación, en especial en el área de tutoría (`학생상담`); la model card exige revisión humana de todos los textos generados.
- Riesgo de alucinación: puede introducir detalles no presentes en las palabras clave; el profesorado debe verificar la veracidad de cada afirmación antes de incorporarla al registro oficial.
- Soporte exclusivo del coreano; no se garantiza un comportamiento correcto en otros idiomas.
- Licencia: al derivar de Gemma 3, el uso está sujeto a los Gemma Terms of Use y a la política de usos prohibidos de Gemma, lo que condiciona el uso comercial y ciertos sectores.
- El repositorio declara dos modelos base (`google/gemma-4-E2B-it` y `google/gemma-3-1b-it`); la ficha de Hugging Face y el recuento de parámetros corresponden a la variante de 1B, pero conviene verificar qué base se usó para cada archivo antes de desplegarlo.
- Sin descargas ni validación comunitaria: no hay evidencia pública de calidad en producción.
- No se documentan la longitud de contexto efectiva ni el comportamiento con entradas largas o fuera de formato.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ssunzoon/sgb-1b-GGUF
- Modelo base Gemma 3 1B: https://huggingface.co/google/gemma-3-1b-it
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
