# Synth-NLP/laya-multilingual-massive-sint-claude-B

## Resumen

Laya multilingual: brazo B, dataset sintético del equipo Claude (identificador `Synth-NLP/laya-multilingual-massive-sint-claude-B`) es un ajuste fino del checkpoint `multilingual` de Laya, desarrollado por Convai Innovations, orientado a la clasificación de intenciones en portugués. El modelo lo publica el colectivo Synth-NLP como artefacto de investigación y deriva de un transformer encoder de aproximadamente 322 millones de parámetros, con licencia Apache 2.0.

El interés del modelo no reside en su rendimiento absoluto, sino en su metodología: todos los datos de entrenamiento son sintéticos, generados por agentes basados en Claude Opus 5.5 que actúan como generador, juez y orquestador, con puertas de validación en código y por embedding, y sin revisión humana. El conjunto cubre 30 intenciones vistas con 5.405 líneas y mantiene la misma distribución por intención que el entrenamiento real de referencia (brazo A).

Se trata, por tanto, de un experimento controlado sobre la viabilidad de sustituir anotación humana por generación sintética en tareas de clasificación de intenciones, con validación externa sobre el dataset `Synth-NLP/massive-pt-br-avaliacao` y comparación directa contra la versión v4 del mismo linaje. El modelo es de investigación y no está pensado para producción sin una evaluación adicional sobre datos reales del dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (checkpoint `multilingual` de Laya; detalles internos no disponibles) |
| Parametros totales | 321.908.998 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | Portugués (`pt`, con etiqueta adicional `pt-br`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | Clasificación de intenciones (text-classification) |
| Numero de intenciones | 30 (vistas en entrenamiento) |
| Tamano del repositorio | 2,0 GB |
| Libreria | `laya` |
| Version de entrenamiento | `laya.train.finetune` 0.4.14 |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `multilingual` de Laya y se ajusta con la librería `laya.train.finetune` en su versión 0.4.14, usando los valores por defecto de la herramienta más `shuffle_options=("choice",)`. El ajuste se ejecutó con semilla 0 sobre una GPU T4; las semillas 1 y 2 están publicadas en las ramas `t4-seed-1` y `t4-seed-2` del repositorio. No se documentan en la información disponible ni la composición exacta del corpus de preentrenamiento de Laya ni detalles de su arquitectura interna (número de capas, dimensión oculta, mecanismo de atención).

El entrenamiento utilizó exclusivamente datos sintéticos: 5.405 líneas correspondientes a 30 intenciones, con la misma cuenta por intención que el entrenamiento real del brazo A (sha256 `8f22c7cce34776322c93234d3ab645ecc15f6005f5599be8bb459254a8ab15b4`). La generación corrió a cargo de agentes Claude Opus 5.5 que actuaban como generador, juez y orquestador, con filtros automáticos en código y por embedding. No hubo revisión humana, y el propio autor señala que el juez era el mismo modelo que el generador y que detectó poco más de la mitad de las frases ambiguas de control. Las frases coincidentes con el conjunto de validación se eliminaron antes del entrenamiento, y la evaluación se realizó fuera de la máquina de entrenamiento tras verificar el sha256 de los pesos.

## Capacidades

- Clasificación de intenciones en portugués sobre un conjunto cerrado de 30 etiquetas.
- Clasificación de texto de una sola pasada (pipeline `text-classification`), sin generación de texto libre.
- Manejo de opciones de elección mediante el parámetro de entrenamiento `shuffle_options=("choice",)`, que aleatoriza el orden de las opciones durante el ajuste.
- Evaluación reproducible en tres semillas de entrenamiento (ramas `t4-seed-1` y `t4-seed-2`).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al portugués según la model card; no se declaran otros idiomas.

## Casos de uso

- Clasificación de intenciones en asistentes conversacionales en portugués: el modelo asigna una de 30 etiquetas a cada turno del usuario, lo que permite enrutar la conversación hacia el flujo adecuado en un bot de atención al cliente.
- Enrutamiento de tickets de soporte: integrado como clasificador previo a un sistema de ticketing, permite etiquetar automáticamente la intención de cada mensaje entrante y asignarlo al equipo correspondiente.
- Investigación sobre datos sintéticos: sirve como brazo de control en experimentos que comparan ajuste fino con anotación humana frente a generación sintética, gracias a que comparte distribución de etiquetas con el brazo real A.
- Evaluación de pipelines de generación de datos: al estar publicado junto a su dataset de evaluación y sus semillas alternativas, permite medir la varianza entre semillas de un mismo proceso sintético.
- Prototipado rápido de clasificadores de dominio cerrado: con 322 millones de parámetros y pesos en safetensors, se puede desplegar en una GPU T4 o similar para validar un producto antes de invertir en anotación real.
- Análisis de sesgo y calidad en datos sintéticos: el modelo y sus resultados permiten estudiar cómo afecta la ausencia de revisión humana y el uso de un juez del mismo modelo generador a la precisión en intenciones no vistas.
- Filtrado previo en pipelines de datos: puede usarse para descartar o marcar utterances cuya intención no encaje en las 30 clases conocidas, siempre que se añada un umbral de confianza y una clase de rechazo.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de validación `Synth-NLP/massive-pt-br-avaliacao` (20 opciones, azar = 0,050), evaluados fuera de la máquina de entrenamiento:

| Conjunto | Accuracy (esta semilla) | Macro-F1 (esta semilla) | Media de 3 semillas | v4, media de 3 semillas | Real (A) |
|---|---:|---:|---:|---:|---:|
| `vistas` | 0,798 | 0,777 | 0,794 | 0,835 | 0,894 |
| `nao_vistas` | 0,704 | 0,648 | 0,692 | 0,732 | 0,729 |

La diferencia frente a la v4 en intenciones no vistas es de -0,040 (IC 95% de -0,060 a -0,019, bootstrap sobre semillas y frases). La v4 se entrenó en A100 y este modelo en T4. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo para pesos (322 M de parámetros), más activaciones y overhead del runtime.
- VRAM estimada en fp16/bf16: aproximadamente 0,65 GB para pesos, más overhead.
- GPU de referencia del autor: NVIDIA T4, suficiente para el ajuste fino y para inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060 y superiores), incluso en fp32.
- Opciones de despliegue: la librería `laya` es la vía documentada; al ser un transformer encoder estándar con pesos safetensors, es compatible con `transformers` y con servidores de inferencia como TGI o vLLM si se exporta el modelo a un formato soportado, aunque esto no está documentado por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy no vistas | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `Synth-NLP/laya-multilingual-massive-sint-claude-B` (este) | 321,9 M | No disponible | 0,704 (0,692 media 3 semillas) | Apache 2.0 | Hugging Face |
| Laya multilingual v4 (brazo sintético previo) | No disponible | No disponible | 0,732 (media 3 semillas) | Apache 2.0 (heredada del base) | Hugging Face |
| Laya multilingual brazo A (datos reales) | No disponible | No disponible | 0,729 | Apache 2.0 (heredada del base) | Hugging Face |
| `convaiinnovations/laya` (modelo base) | No disponible | No disponible | No evaluado en esta tarea | Apache 2.0 | Hugging Face |

La comparación se limita al linaje Laya porque la información disponible no incluye referencias a otros clasificadores de intenciones en portugués evaluados sobre el mismo conjunto.

## Limitaciones y advertencias

- Modelo de investigación: el autor lo declara explícitamente como tal y no recomienda su uso en producción sin validación adicional.
- Datos exclusivamente sintéticos y sin revisión humana: el juez era el mismo modelo que el generador y solo detectó poco más de la mitad de las frases ambiguas de control, lo que introduce un sesgo de autoevaluación no cuantificado.
- Rendimiento inferior a la v4 en intenciones no vistas (-0,040 de accuracy, IC 95% -0,060 a -0,019), por lo que no es la mejor opción del linaje para generalización.
- Cobertura limitada a 30 intenciones; cualquier entrada fuera de ese conjunto se forzará a una de las clases conocidas, con riesgo de etiquetado incorrecto silencioso.
- Idioma restringido al portugués: no se declara ni se evalúa su comportamiento en otros idiomas.
- Riesgo de alucinación de etiqueta: al ser un clasificador de conjunto cerrado, no dispone de mecanismo nativo de rechazo o abstención.
- Sesgos conocidos: no documentados en la información disponible; la generación sintética por un único modelo puede heredar sus sesgos lingüísticos y de dominio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los pesos derivan de Laya (Convai Innovations) y la atribución debe mantenerse.
- El ajuste se realizó en una T4 mientras que la v4 se entrenó en A100, una diferencia de hardware que el autor señala y que puede afectar a la comparabilidad de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/laya-multilingual-massive-sint-claude-B
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Dataset de evaluación: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-avaliacao
- Ramas con semillas alternativas: `t4-seed-1` y `t4-seed-2` en el repositorio del modelo
