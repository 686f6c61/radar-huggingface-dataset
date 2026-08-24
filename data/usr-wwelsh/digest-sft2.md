# usr-wwelsh/digest-sft2

## Resumen

`digest-sft2` es un fine-tune completo (full fine-tune, sin LoRA) del modelo `HuggingFaceTB/SmolLM2-135M-Instruct`, desarrollado por William Welsh (usr-wwelsh). Su propósito es generar resúmenes de diario de desarrollador en formato Markdown a partir de la actividad de commits de GitHub de un día, destilando el comportamiento de los resúmenes escritos por Claude en el proyecto `git-digest`. El objetivo declarado es ejecutar la escritura de estos resúmenes de forma totalmente offline en CPU, sin necesidad de claves de API ni servicios en la nube.

El modelo se entrenó con 101 pares de datos `(commits.json → digest.md)`, de los cuales 84 corresponden a días reales y 17 a ejemplos sintéticos verificados. El checkpoint publicado fue seleccionado por su recompensa media (0.499) sobre un conjunto de evaluación retenido de 10 días, utilizando criterios de formato, fidelidad al repositorio, cobertura y repetición, en lugar de confiar únicamente en la pérdida de entrenamiento. Es la base SFT de un pipeline que incluye un paso posterior de GRPO/RLVR actualmente en progreso.

Con 134,5 millones de parámetros y licencia Apache-2.0, este modelo es extremadamente ligero y está pensado para entornos con recursos limitados. Su relevancia radica en ofrecer una alternativa local y privada a los servicios de resumen basados en la nube, manteniendo un formato estructurado y verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles (probablemente ingles tecnico, no declarado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros. El fine-tune se realizó de forma completa (sin LoRA) sobre el conjunto de datos descrito, utilizando el `SFTTrainer` de TRL (versión 1.10.0) con 6 épocas y ejecución en CPU (6 hilos). El entrenamiento se hizo en precisión fp32 y se guardaron checkpoints por paso para permitir la selección basada en recompensa.

La selección del checkpoint final se basó en una función de recompensa (`scripts/reward.py`) que evalúa formato, fidelidad al repositorio, cobertura de actividad y ausencia de repetición. La recompensa media obtenida en el conjunto de evaluación retenido fue de 0.499. No se aplicó RLHF ni DPO en esta fase; el pipeline incluye un paso posterior de GRPO/RLVR que aún no se ha publicado. Los datos de entrenamiento provienen de resúmenes generados por Claude, lo que constituye una destilación de conocimiento de un modelo mucho mayor hacia uno pequeño.

## Capacidades

- Generacion de resumenes de diario de desarrollador en Markdown a partir de un JSON de commits de GitHub.
- Estructura de salida fija con secciones `## Summary` y `## Per-Repo Activity`.
- Ejecucion offline en CPU sin dependencias de servicios externos.
- Hereda capacidades basicas de generacion de texto y conversacion del modelo base SmolLM2-135M-Instruct.
- No soporta tool calling, vision, audio ni otras modalidades.
- Requiere un prompt especifico con el formato de commits y las instrucciones de salida.

## Casos de uso

- Automatizacion de resumenes diarios para desarrolladores individuales: el modelo puede procesar el JSON de commits del dia y generar una entrada de diario en Markdown, permitiendo al desarrollador revisar su actividad sin escribirla manualmente.
- Integracion en pipelines de CI/CD: se puede ejecutar como paso posterior a cada push o al final del dia para generar un changelog o resumen de actividad del repositorio, sin depender de APIs externas.
- Herramientas de productividad para equipos con restricciones de conectividad: al funcionar en CPU y sin conexion, es util en entornos aislados o con politicas de privacidad estrictas.
- Generacion de informes de actividad para repositorios open source: los mantenedores pueden obtener un resumen diario de los commits de colaboradores, facilitando la revision de progreso.
- Documentacion automatica de progreso en proyectos: el modelo puede alimentar un registro de actividad en un wiki o sistema de documentacion, manteniendo un historial legible.
- Base para fine-tunes adicionales: al ser un checkpoint SFT, puede servir como punto de partida para entrenamientos con GRPO/RLVR u otras tecnicas de refuerzo, como se indica en el repositorio.
- Asistente local para desarrolladores que priorizan la privacidad: permite generar resumenes sin enviar datos de codigo a servicios en la nube, cumpliendo requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la recompensa media de 0.499 sobre 10 dias retenidos, calculada con la funcion de recompensa propia del autor (formato, grounding del repositorio, cobertura y repeticion). Ademas, se indica que la decodificacion greedy requiere un repetition penalty de al menos 1.05 para evitar bucles de generacion.

## Requisitos de hardware

- Al ser un modelo de 135 millones de parametros, es adecuado para ejecucion en CPU sin GPU.
- En GPU, la VRAM estimada para inferencia en fp32 es inferior a 1 GB (aproximadamente 540 MB para los pesos, mas overhead), por lo que cabe en cualquier GPU moderna, incluidas las de gama baja.
- Se puede desplegar con la libreria `transformers` directamente, o mediante `text-generation-inference` (segun los tags del repositorio).
- No se proporcionan datos de latencia o throughput especificos, pero en CPU se espera una generacion de 450 tokens en un tiempo razonable para un modelo de este tamano.
- El entrenamiento se realizo en CPU (6 hilos), lo que confirma que la inferencia tambien es viable en ese tipo de hardware.

## Comparativa con modelos similares

No disponible. Este modelo es un fine-tune muy especializado para una tarea concreta (resumen de commits) y no existen modelos comparables publicados con la misma funcion. Se podria comparar con el modelo base `SmolLM2-135M-Instruct`, pero no se dispone de datos de rendimiento relativo en esta tarea especifica. Tampoco hay alternativas conocidas de la misma categoria en cuanto a tamano y proposito.

## Limitaciones y advertencias

- Entrenado con solo 101 ejemplos, lo que implica un alto riesgo de overfitting y una generalizacion limitada a repositorios o formatos de commits no vistos.
- Puede alucinar contenido en repositorios que no siguen el patron de los datos de entrenamiento, generando resumenes inexactos.
- Requiere un prompt muy especifico y un formato de entrada rigido; cualquier desviacion puede degradar la calidad de la salida.
- La decodificacion greedy sin repetition penalty produce bucles; es necesario configurar un valor de al menos 1.05.
- No se especifican los idiomas soportados; es probable que solo funcione bien con texto en ingles tecnico, dado el origen de los datos.
- La licencia Apache-2.0 permite uso comercial, pero el codigo de entrenamiento esta bajo MIT; se debe verificar la atribucion correspondiente.
- No hay garantias de calidad en produccion; se recomienda validar las salidas antes de usarlas en flujos criticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/usr-wwelsh/digest-sft2
- Repositorio de fine-tune (digest-finetune): https://github.com/usr-wwelsh/digest-finetune
- Repositorio de generacion de resumenes (git-digest): https://github.com/usr-wwelsh/git-digest
- Perfil de GitHub del autor: https://github.com/usr-wwelsh
