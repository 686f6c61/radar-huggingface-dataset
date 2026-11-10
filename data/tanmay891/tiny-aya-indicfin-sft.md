# tanmay891/tiny-aya-indicfin-sft

## Resumen

`tanmay891/tiny-aya-indicfin-sft` es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario tanmay891 sobre el modelo base `CohereLabs/tiny-aya-global`, un modelo de la familia Tiny Aya de Cohere Labs. El repositorio contiene únicamente los pesos del adaptador PEFT (0,3 GB), no el modelo completo, por lo que su uso requiere cargar el modelo base y aplicar el adaptador mediante la librería `peft`.

El nombre del repositorio sugiere un ajuste orientado a dominios financieros en lenguas índicas ("indicfin"), aunque la model card no documenta explícitamente el conjunto de datos, el idioma ni el objetivo del entrenamiento. La información publicada es mínima: la model card es la plantilla por defecto de Hugging Face sin rellenar, con la mayoría de campos marcados como "More Information Needed".

Por su naturaleza (adaptador LoRA sobre un modelo pequeño de la familia Aya orientada a cobertura multilingüe), el interés principal es experimental: sirve como ejemplo de ajuste eficiente con Unsloth y TRL sobre un modelo base multilingüe, pero carece de documentación, evaluación y licencia declarada, lo que limita seriamente su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (modelo base `CohereLabs/tiny-aya-global`) |
| Parámetros totales | no disponible (el adaptador ocupa 0,3 GB en disco; los parámetros del modelo base no se detallan en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de su ecosistema) |
| Idiomas soportados | no disponible (el nombre sugiere orientación a lenguas índicas, sin confirmación documental) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con SFT sobre el modelo base `CohereLabs/tiny-aya-global`. Las etiquetas del repositorio indican el uso de `transformers`, `trl`, `unsloth` y `peft` (versión 0.21.2 según la model card), lo que apunta a un flujo de ajuste eficiente en memoria con Unsloth y el `SFTTrainer` de TRL. No se especifican rango del adaptador, alpha, módulos objetivo ni hiperparámetros de entrenamiento.

No hay información sobre el volumen de datos, la composición del dataset, la existencia de fases de RLHF/DPO ni innovaciones técnicas. La model card no incluye sección de datos de entrenamiento ni de procedimiento más allá de la plantilla vacía. Tampoco se documenta el objetivo concreto del ajuste (el sufijo "indicfin" sugiere finanzas en lenguas índicas, pero es una inferencia no confirmada).

## Capacidades

- Generación de texto conversacional, heredada del pipeline `text-generation` y de la etiqueta `conversational`.
- Ajuste específico de dominio no documentado: el nombre del repositorio sugiere especialización en contenido financiero en lenguas índicas, sin confirmación en la model card.
- Cobertura multilingüe potencial: el modelo base pertenece a la familia Aya, orientada a cobertura lingüística amplia; el alcance efectivo tras el ajuste no está documentado.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Experimentación con ajuste eficiente: el adaptador sirve como referencia práctica para reproducir un pipeline SFT con Unsloth + TRL + PEFT sobre un modelo base pequeño, útil en entornos con GPU de gama media.
- Investigación sobre adaptación de dominio en lenguas de bajos recursos: si se confirma la orientación a lenguas índicas, puede emplearse como punto de partida para estudiar cómo un adaptador LoRA modifica el comportamiento de un modelo multilingüe en un dominio concreto.
- Prototipado de asistentes financieros en fase de pruebas: solo en entornos controlados y con validación humana, dado que no hay evaluación publicada ni licencia declarada.
- Comparación de estrategias de fine-tuning: permite contrastar el adaptador con el modelo base sin ajustar para medir la deriva de comportamiento introducida por el SFT.
- Docencia y formación: ejemplo didáctico de cómo se estructura un repositorio de adaptador PEFT (configuración, pesos y metadatos) y de cómo cargarlo con `PeftModel.from_pretrained`.
- Base para ajustes posteriores: al ser un adaptador ligero, puede combinarse o continuarse con otros adaptadores en experimentos de composición LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador en sí; depende enteramente del tamaño del modelo base `CohereLabs/tiny-aya-global`, cuyos parámetros no se detallan en la información proporcionada.
- GPU recomendadas: no disponible. Al tratarse de un adaptador PEFT, la inferencia requiere cargar el modelo base completo más el adaptador, por lo que los requisitos vienen determinados por el modelo base.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio del adaptador (0,3 GB) no es indicativo del modelo base.
- Opciones de despliegue: carga mediante `transformers` + `peft` (`PeftModel.from_pretrained`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que en general requieren fusionar el adaptador con el modelo base (`merge_and_unload`) antes de su uso.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Documentación |
|---|---|---|---|---|---|
| `tanmay891/tiny-aya-indicfin-sft` | Adaptador LoRA sobre Tiny Aya Global | no disponible | no disponible | no disponible | Plantilla vacía |
| `CohereLabs/tiny-aya-global` (modelo base) | Modelo completo, familia Aya | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Model card oficial de Cohere Labs |
| Otros adaptadores SFT comunitarios sobre Aya | Adaptador LoRA | variable | variable | variable | habitualmente escasa |

La comparación cuantitativa no es posible con la información proporcionada: no se dispone de parámetros del modelo base, resultados de evaluación ni términos de licencia de ninguna de las variantes.

## Limitaciones y advertencias

- Model card sin rellenar: no hay información sobre datos, hiperparámetros, evaluación ni uso previsto, lo que impide validar el comportamiento del adaptador.
- Licencia no declarada: no se puede confirmar el uso comercial ni la redistribución; la licencia del adaptador podría además estar condicionada por la del modelo base.
- Sin resultados de evaluación: no hay benchmarks ni métricas que permitan estimar la calidad o la degradación respecto al modelo base.
- Riesgo de alucinación: inherente a los modelos generativos y no cuantificado para este adaptador; en dominio financiero el riesgo es especialmente relevante.
- Sesgos: no documentados; al heredar el modelo base y un dataset de ajuste desconocido, pueden amplificarse sesgos de dominio o lingüísticos.
- Cobertura idiomática incierta: el ajuste puede haber desplazado el equilibrio multilingüe del modelo base hacia los idiomas presentes en el dataset de SFT, que se desconoce.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación futura (2026-11-10) en los metadatos: conviene verificar la integridad y procedencia del artefacto antes de utilizarlo.
- Para producción sería imprescindible fusionar el adaptador, evaluar en el dominio objetivo y revisar los términos del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tanmay891/tiny-aya-indicfin-sft
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
