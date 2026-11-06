# ThakiCloud/Thaki-InputGuard-KO-9M

## Resumen

Thaki-InputGuard-KO-9M es un modelo coreano de corrección de entrada de texto desarrollado por ThakiCloud. Con 8,2 millones de parámetros, no es un modelo generativo al uso: es un *edit tagger* que predice, carácter a carácter, qué etiqueta de edición aplicar (sustitución, borrado o inserción) sobre una frase ruidosa típica de escritura rápida en móvil o de un reconocedor de voz. Al no generar texto libre, no puede alucinar contenido nuevo y respeta los fragmentos que se le indica proteger.

El modelo se presenta como una solución *on-device* para preprocesado de entrada en coreano, con una ventana de hasta 192 caracteres y un vocabulario de salida de 1.659 caracteres. Su evaluación principal es un test sellado y preregistrado con 13.605 filas y 7.198 familias, en el que obtiene un Edit F0.5 de 0,6929 frente a 0,5277 de la herramienta de espaciado kiwi 0.24.1, una mejora de +0,1652 con intervalo de confianza del 95% [0,1409, 0,1896].

La relevancia actual del modelo es doble: por un lado, demuestra que un modelo de menos de 10 millones de parámetros puede superar a herramientas basadas en reglas en corrección de erratas de teclado; por otro, su propia model card es inusualmente honesta sobre sus límites, advirtiendo que es débil en errores semánticos de ASR (F0.5 de 0,159) y que nunca se ha ejecutado en un teléfono real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MicroBrain-multihead: embeddings de carácter/jamo, 1 pila de encoder y cabezas de edición |
| Parametros totales | 8.219.115 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 192 caracteres de entrada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | thaki-inputguard-ko-9m-research (licencia propia, ver LICENSE.md) |
| Formato de pesos | safetensors, PyTorch |
| Pipeline | token-classification |
| Vocabulario de salida | 1.659 caracteres |
| Dispositivo medido | CPU y GPU única (servidor); no medido en teléfono |

## Arquitectura y entrenamiento

La arquitectura, denominada `MicroBrain-multihead`, combina embeddings a nivel de carácter y de jamo con una única pila de encoder y varias cabezas de edición que predicen etiquetas por carácter: una etiqueta base y una etiqueta de inserción (*append*). Las ediciones se aplican de forma iterativa durante un número configurable de pasadas (por defecto 3). El modelo es un clasificador de tokens, no un decoder generativo, lo que restringe su salida a operaciones sobre un vocabulario fijo de 1.659 caracteres.

No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card indica explícitamente que el repositorio contiene solo pesos, configuración y código mínimo de inferencia, sin datos de entrenamiento ni corpus derivados. La evaluación se realizó con un protocolo preregistrado: el umbral de decodificación (celda 0.98 / 0.0 / 3 pasadas) y la línea base primaria se congelaron sobre el split de validación y se commitearon antes de desencriptar el test. El remuestreo estadístico se agrupó por familia de frases para evitar dependencias entre variantes casi duplicadas.

## Capacidades

- Corrección de erratas de teclado: sustituciones por teclas vecinas (vocales o consonantes), consonante final omitida y falta de mayúsculas por shift.
- Corrección de espaciado: inserción de espacios omitidos entre palabras.
- Etiquetado de ediciones por carácter con aplicación iterativa en N pasadas.
- Protección de spans: los fragmentos marcados como protegidos no se modifican (0 violaciones en 13.605 filas).
- Salida restringida al vocabulario de 1.659 caracteres, lo que impide la generación de contenido nuevo.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador de tokens.
- Capacidad multilingüe limitada al coreano.
- No dispone de modo de razonamiento (*thinking*), visión ni audio.

## Casos de uso

- Preprocesado de entrada en teclados móviles: el modelo puede corregir erratas de tecleo rápido antes de enviar un mensaje, con la ventaja de que al ser un edit tagger no reescribe la frase del usuario ni introduce contenido ajeno.
- Corrección de espaciado en formularios y buscadores: útil para normalizar consultas coreanas donde los espacios omitidos degradan la recuperación; la model card reporta 11 de 20 espacios omitidos corregidos en su prueba interna.
- Limpieza de texto en pipelines de moderación o análisis: al respetar spans protegidos, puede normalizar entradas sin alterar nombres propios, URLs o identificadores que el sistema marque como intocables.
- Preprocesado ligero en entornos con recursos limitados: con 8,2 millones de parámetros y pesos en safetensors, es candidato a despliegue en CPU o GPU de gama baja, aunque no se ha validado en dispositivos móviles.
- Normalización de texto para sistemas de búsqueda o indexación en coreano: la corrección de erratas de teclado mejora la coincidencia de términos sin riesgo de deriva semántica.
- Filtro conservador en asistentes de escritura: dado su sesgo hacia la precisión (F0.5 pondera la precisión el doble que el recall), encaja en escenarios donde un falso positivo es más costoso que una corrección omitida.
- No recomendado como poscorrector de ASR: la model card lo desaconseja explícitamente por su F0.5 de 0,159 y su recall de 0,041 en errores de reconocimiento de voz.

## Benchmarks y rendimiento

Test sellado, 13.605 filas / 7.198 familias, celda de decodificación 0.98 / 0.0 / 3 pasadas:

| Sistema | Precision | Recall | Edit F0.5 | Sentence EM | changed_rate |
|---|---|---|---|---|---|
| InputGuard-9M | 0,870502 | 0,381521 | 0,692891 | 0,150092 | 0,729144 |
| kiwi 0.24.1 (solo espaciado) | 0,579450 | 0,388719 | 0,527668 | 0,063359 | 0,929658 |
| rules (3 sustituciones) | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |
| copy (identidad) | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |

Diferencia frente a kiwi: +0,165223, IC95% con bootstrap agrupado por familia [0,140917, 0,189578], 2000 remuestreos, semilla 20261030.

Desglose por tipo de ruido:

| Subconjunto | Filas | Precision | Recall | F0.5 | Sentence EM |
|---|---|---|---|---|---|
| TYPO (teclado) | 12.280 | 0,876276 | 0,422356 | 0,721246 | 0,166287 |
| ASR (voz) | 1.325 | 0,556793 | 0,041173 | 0,158871 | 0,0 |

Números de desarrollo (validación, solo comparativo):

| Celda | Edit F0.5 | ASR F0.5 | TYPO F0.5 |
|---|---|---|---|
| 0.98 / 0.0 / 3 (congelada) | 0,731709 | no disponible | no disponible |
| 0.92 / 0.15 / 2 | 0,713706 | 0,261905 | 0,746183 |

Prueba interna controlada (job 1031m): 20 frases cotidianas y 84 variantes con una errata cada una; el modelo corrigió 15 de 84 sin cambios incorrectos y dejó intactas las 20 frases limpias. Espacios omitidos: 11 de 20 corregidos; teclas vecinas de consonante: 0 de 20.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 8,2 millones de parámetros en fp32 los pesos ocupan aproximadamente 33 MB, y en fp16 unos 16 MB, aunque no se han publicado requisitos oficiales.
- GPU recomendadas: no disponible; la model card solo indica que se midió en CPU y en una GPU única de servidor.
- Cabe en GPU de consumo: previsiblemente sí por tamaño, pero no se ha validado ni documentado.
- Despliegue: el repositorio incluye `inference.py` y el módulo `inputguard_min` con `load_guard`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; la tabla comparativa de la model card incluye una columna de latencia en CPU p5 que aparece truncada en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Edit F0.5 (test sellado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thaki-InputGuard-KO-9M | 8.219.115 | 192 caracteres | 0,692891 | thaki-inputguard-ko-9m-research | Hugging Face |
| kiwi 0.24.1 (solo espaciado) | no disponible | no disponible | 0,527668 | no disponible | no disponible en la información |
| rules (3 sustituciones) | no aplica | no aplica | 0,0 | no disponible | no disponible en la información |
| copy (identidad) | no aplica | no aplica | 0,0 | no disponible | no disponible en la información |

No se dispone de datos de otros correctores coreanos abiertos en la información proporcionada; la model card menciona una comparativa exploratoria en validación contra correctores abiertos, pero los resultados aparecen truncados.

## Limitaciones y advertencias

- Débil en errores semánticos de ASR: recall de 0,041 y F0.5 de 0,159 en el subconjunto de voz; cero frases completamente correctas. No debe usarse como poscorrector de reconocimiento de voz.
- En un corpus independiente no visto, cambió entre el 13% y el 19% de frases que no necesitaban cambio y recuperó solo entre el 6% y el 17% de las ediciones necesarias.
- Nunca se ha ejecutado en un teléfono, pese a su etiqueta *on-device*.
- Techo de recall por vocabulario: un carácter correcto fuera de los 1.659 del vocabulario es inalcanzable (0,037% de las filas de test).
- Comportamiento conservador por diseño: omite muchas erratas antes que inventar ediciones; en la prueba interna corrigió 0 de 20 erratas por teclas vecinas de consonante.
- Los números publicados solo son válidos con la celda de decodificación congelada (0.98 / 0.0 / 3 pasadas); modificar `min_prob`, `min_margin` o `passes` invalida las cifras.
- Licencia propia de investigación (`thaki-inputguard-ko-9m-research`): deben revisarse en LICENSE.md las restricciones para uso comercial antes de producción.
- Solo coreano; sin capacidades multilingües.
- No se han documentado sesgos específicos ni tasas de alucinación (el formato de edición los limita por diseño, pero no los elimina).
- El repositorio no incluye datos de entrenamiento ni corpus de evaluación, lo que dificulta la reproducción independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/Thaki-InputGuard-KO-9M
- Model card en coreano: https://huggingface.co/ThakiCloud/Thaki-InputGuard-KO-9M/blob/main/MODEL_CARD.ko.md
- Licencia: https://huggingface.co/ThakiCloud/Thaki-InputGuard-KO-9M/blob/main/LICENSE.md
