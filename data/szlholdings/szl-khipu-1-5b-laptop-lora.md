# SZLHOLDINGS/SZL-Khipu-1.5B-laptop-lora

## Resumen

SZL-Khipu-1.5B-laptop-lora es un artefacto de investigación publicado en Hugging Face por SZLHOLDINGS bajo el identificador `SZLHOLDINGS/SZL-Khipu-1.5B-laptop-lora`. Por el nombre se infiere que se trata de un adaptador LoRA orientado a un modelo base de aproximadamente 1.500 millones de parámetros, con un enfoque declarado de ejecución en portátil ("laptop"), pero la model card no confirma esta correspondencia ni documenta el modelo base sobre el que se aplica el adaptador. El repositorio se describe explícitamente como un "private registry artifact of the SZLHOLDINGS estate", es decir, un artefacto de registro privado del autor, no un modelo pensado para uso general.

La model card actual, fechada el 14 de noviembre de 2026, es una reescritura que retira todas las afirmaciones de la versión anterior (una "wave-4 uniform stamp" con model-index, tabla de entrenamiento QLoRA y badges de receipts) porque, según el propio autor, la doctrina de "fail-closed" del estate no permite verificarlas por modelo. En consecuencia, la ficha declara de forma explícita que no se ha medido nada: no hay evaluación, benchmark, batería de pruebas, contrato de entrenamiento, tabla de hiperparámetros, afirmación sobre el dataset, ni garantía de preparación para producción o equivalencia de pesos.

El interés de este repositorio es, por tanto, limitado y de naturaleza metodológica: ilustra una práctica de publicación que prefiere retirar claims no verificables antes que mantenerlos. Para un desarrollador o investigador que busque un modelo utilizable, el artefacto no ofrece información suficiente para evaluarlo, y su tamaño de repositorio reportado (0.0 GB) sugiere que los pesos pueden no estar presentes o no ser accesibles en la revisión observada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere adaptador LoRA; modelo base no especificado) |
| Parámetros totales | no disponible (el nombre sugiere ~1.5B en el modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

No hay información verificable sobre la arquitectura. El identificador incluye "1.5B" y "lora", lo que apunta a un adaptador de bajo rango (LoRA) sobre un transformer de aproximadamente 1.500 millones de parámetros, y "laptop" sugiere un objetivo de inferencia en hardware de consumo. Sin embargo, la model card no confirma el modelo base, el rango del adaptador, las capas objetivo ni la configuración de entrenamiento.

La versión anterior de la tarjeta incluía una tabla de entrenamiento QLoRA y un model-index, pero el autor los ha retirado argumentando que no existen evidencias verificables por modelo en la revisión observada. La tarjeta actual no afirma ningún contrato de entrenamiento, hiperparámetro, composición de dataset ni proceso de alineación (RLHF/DPO). Tampoco se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, etc.).

## Capacidades

- No se declara ninguna capacidad verificada para este artefacto.
- No hay confirmación de generación de texto, razonamiento, código o matemáticas.
- No hay información sobre tool calling o function calling.
- No hay información sobre uso en agentes o razonamiento multi-paso.
- No hay información sobre capacidades multilingües.
- No hay información sobre modos especiales (thinking mode, visión, audio).
- El autor indica explícitamente que no se realiza ninguna afirmación de preparación para producción ni de equivalencia de pesos.

## Casos de uso

- Archivo y trazabilidad de artefactos internos: el repositorio puede servir como registro de una revisión concreta dentro de un estate privado, con la ventaja de que la tarjeta documenta la revisión observada (`d6c86d041f66b5d1bb1f3fd5437c88345c0cf38a`) y el cambio de política de publicación.
- Estudio de prácticas de gobernanza de modelos: resulta útil como ejemplo de retirada de claims no verificables ("fail-closed") en la documentación de un modelo, aplicable a auditorías internas de MLOps.
- Reproducción de un flujo de publicación con receipts: el autor referencia una visualización de receipts encadenados; el repositorio puede emplearse para estudiar ese mecanismo de vinculación de evidencias, aunque no se aportan detalles técnicos del mismo.
- Pruebas de carga de adaptadores LoRA en pipelines internos: si los pesos estuvieran disponibles en otra revisión, podría probarse la carga de un adaptador safetensors en un entorno controlado, pero esto no está confirmado por la tarjeta.
- Docencia sobre limitaciones de la documentación de modelos: sirve como caso práctico de por qué una model card sin mediciones no permite evaluar un artefacto.
- No se recomienda su uso en atención al cliente, generación de código en producción, análisis documental ni ninguna aplicación final, dada la ausencia total de evidencias de rendimiento y de especificación del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente: "No evaluation, benchmark, or battery result is claimed for this artifact."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Si se confirmara un modelo base de ~1.5B, una estimación orientativa en FP16 sería de ~3 GB de pesos, y en cuantización de 4 bits de ~1 GB, pero estos cálculos no están respaldados por la tarjeta y deben tratarse como especulación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada, pese a la etiqueta "laptop" del nombre.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica el modelo base ni ofrece métricas que permitan una comparación con alternativas de la misma categoría (adaptadores LoRA de ~1.5B, modelos pequeños para portátil, etc.). Cualquier comparación sería especulativa.

## Limitaciones y advertencias

- Ausencia total de evidencias: no hay benchmarks, evaluación, contrato de entrenamiento ni dataset documentado; el artefacto no es evaluable con la información disponible.
- Modelo base no identificado: se desconoce sobre qué pesos se aplica el adaptador, lo que impide verificar compatibilidad y comportamiento.
- Tamaño de repositorio reportado de 0.0 GB: los pesos podrían no estar presentes o no ser accesibles en la revisión observada; conviene verificar los archivos antes de cualquier uso.
- Visibilidad privada: la tarjeta indica que la visibilidad privada no cambia con la edición; el acceso puede estar restringido.
- Sin garantía de preparación para producción: el autor lo declara explícitamente; no debe desplegarse en entornos productivos.
- Riesgo de alucinación y sesgos: no evaluables, al no existir mediciones ni especificación del modelo base.
- Licencia apache-2.0: permite uso comercial según los términos de la licencia, pero esta no sustituye la falta de validación técnica ni las posibles restricciones del modelo base subyacente, que se desconoce.
- Historial de revisiones: la tarjeta anterior contenía claims retirados; si se reutiliza una revisión antigua, hay que asumir que sus afirmaciones no están verificadas.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-laptop-lora
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
