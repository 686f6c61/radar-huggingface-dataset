# xingxm/DesignCoder

## Resumen

DesignCoder es una coleccion de checkpoints de ajuste fino supervisado (SFT) de parametros completos orientada a la generacion de interfaces de usuario y a la implementacion end-to-end en HTML, CSS y JavaScript. La publica el usuario xingxm en Hugging Face y agrupa ocho checkpoints construidos sobre modelos base de la familia Qwen (Qwen3.5 en escalas 4B y 9B, y Qwen3.6/Qwen3.8 en 27B), con el objetivo declarado de servir como material de investigacion en diseno de UI y como generador de front-end funcional.

Cada subcarpeta del repositorio es un checkpoint autocontenido y cargable de forma directa. El modelo no es un unico artefacto: es una familia con ejes de ablacion explicitos sobre optimizador (Muon frente a AdamW), revision de dataset (37.865 frente a 41.287 muestras) y escala de parametros. El checkpoint mas fuerte reportado es el de 27B con AdamW, que alcanza 87,04 sobre 100 en el benchmark propio bench-200 con la rubrica V5.9.2.

La relevancia actual viene de su enfoque de evaluacion: en lugar de medir solo la generacion de codigo, puntua la salida renderizada mediante capturas de pantalla y un juez con vision, con tres familias de rubrica independientes. El repositorio ocupa 340,3 GB, lo que refleja que contiene los pesos completos de todos los checkpoints en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelos base Qwen3.5, Qwen3.6 y Qwen3.8); detalles internos no disponibles |
| Parametros totales | 4B, 9B y 27B segun checkpoint |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Los checkpoints son ajustes de parametros completos (full-parameter SFT) sobre modelos base de la familia Qwen. La nomenclatura documentada sigue el patron `designcoder_{basemodel}_{size}_{optimizer}_bs{global_batch}[_{extra_axes}]_step{global_step}`, donde el optimizador puede ser `muon` o `adamw`, `bs` es el tamano de lote global efectivo (per_device x grad_accum x world_size) y los ejes extra recogen desviaciones de la receta por defecto, como `wd0.05` (weight decay, por defecto 0,0), `ep20` (epocas, por defecto 2) o `data41287` (revision del dataset).

Se documentan dos revisiones de dataset: `data37865` con 37.865 muestras, usada por los checkpoints `step1900` y `step3800`, y `data41287` con 41.287 muestras, usada por los checkpoints `step200` y `step400`. El autor advierte que las puntuaciones y valores de perdida solo son comparables dentro de la misma revision. Las tasas de aprendizaje van de 1e-5 a 2e-5 y los lotes globales de 16 a 256. No se detalla la composicion del dataset, el numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

La innovacion tecnica destacable no esta en la arquitectura sino en el protocolo de evaluacion: el benchmark bench-200 congela 200 casos y puntua la salida renderizada con un juez multimodal (`gpt-5.6-sol`) mediante capturas de pantalla, combinando comprobaciones binarias con rubricas de ajuste al prompt y comprobaciones estaticas sobre el DOM y el comportamiento.

## Capacidades

- Generacion de codigo front-end completo en HTML, CSS y JavaScript a partir de una descripcion de diseno.
- Generacion de interfaces de dos superficies diferenciadas: landings y dashboards.
- Soporte de casos con estilo especificado (Track A) y sin estilo (Track B).
- Produccion de graficos y flujos de trabajo funcionales en dashboards, evaluados por las comprobaciones estaticas `d_data_*` y `d_work_*`.
- Capacidades de razonamiento y codigo general heredadas del modelo base Qwen, aunque no se documentan de forma explicita.
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Prototipado rapido de landings: dado un brief de producto y un estilo, el modelo genera una pagina completa en HTML/CSS/JS que puede renderizarse y revisarse de inmediato, lo que reduce el ciclo de iteracion en fases de exploracion de diseno.
- Generacion de dashboards de administracion: los checkpoints de mayor escala mantienen mejor la funcionalidad de graficos y flujos de trabajo, por lo que son adecuados para producir paneles con tablas, filtros y visualizaciones conectadas.
- Investigacion en evaluacion de modelos de UI: el repositorio incluye artefactos de evaluacion (puntuaciones por caso, pruebas de significancia) que permiten reproducir comparativas entre escalas y optimizadores sin construir un pipeline propio.
- Ablacion de optimizadores en SFT: los pares Muon/AdamW con el mismo modelo base y paso permiten estudiar el efecto del optimizador en una tarea de generacion estructurada, con resultados cuantificados en bench-200.
- Generacion de componentes aislados: el modelo puede producir fragmentos de interfaz (formularios, tarjetas, barras de navegacion) que se integren manualmente en una base de codigo existente, dado su entrenamiento en HTML/CSS/JS.
- Creacion de conjuntos de datos sinteticos de interfaces: las salidas renderizadas pueden servir como material de entrenamiento o de aumento de datos para otros modelos de generacion de UI, siempre que se respete la licencia MIT.
- Evaluacion comparativa de jueces multimodales: el protocolo con capturas de pantalla y rubrica estructurada es reutilizable para medir otros generadores de front-end con el mismo juez.

## Benchmarks y rendimiento

Resultados del benchmark propio bench-200 (n=200 por modelo, rubrica completa V5.9.2, juez `gpt-5.6-sol`):

| Modelo | Overall | Prompt Fit | Static | Frozen | Landing | Dashboard | Track A | Track B | Fallos de render |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 27B AdamW step400 | 87,04 | 84,10 | 87,31 | 88,52 | 89,65 | 82,19 | 86,56 | 88,16 | 0/200 |
| 9B AdamW step200 | 82,14 | 78,35 | 82,20 | 85,41 | 86,96 | 73,19 | 82,71 | 80,82 | 1/200 |
| 4B AdamW step200 | 80,06 | 75,25 | 80,40 | 83,27 | 85,70 | 69,59 | 80,61 | 78,78 | 1/200 |
| 4B Muon step200 | 71,34 | 64,60 | 70,96 | 79,79 | 78,48 | 58,06 | 72,05 | 69,68 | 3/200 |

Las puntuaciones son monotonas en escala. Cinco de las seis diferencias por pares son significativas (bootstrap pareado de 10.000 remuestreos, IC del 95 % excluye 0, Wilcoxon p < 4e-7); la diferencia entre 9B y 4B con AdamW no es significativa (diferencia media +2,08, IC [-0,03, 4,18], p = 0,065). Los dashboards son el cuello de botella: el 27B pierde 7,5 puntos al pasar de landing a dashboard, mientras que el 4B con Muon pierde 20,4.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, los pesos en safetensors sin cuantizar requieren aproximadamente 8 GB para 4B, 18 GB para 9B y 54 GB para 27B en BF16; a eso hay que sumar la memoria de activaciones y cache KV, que depende de la longitud de contexto (no documentada).
- GPU recomendadas: para el checkpoint de 27B, una A100 80 GB o H100 80 GB en BF16; para 9B, una A100 40 GB o H100; para 4B, una RTX 4090 de 24 GB es suficiente en BF16.
- Cabe en GPU de consumo: el 4B si, en RTX 4090 y potencialmente en RTX 3090; el 9B y el 27B requieren cuantizacion para caber en 24 GB, pero no se distribuyen pesos cuantizados.
- Opciones de despliegue: transformers de forma nativa; vLLM, TGI, llama.cpp u Ollama no estan documentados por el autor, aunque al ser pesos safetensors estandar de transformers son compatibles con los servidores que los aceptan.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DesignCoder 27B AdamW | 27B | no disponible | 87,04 en bench-200 | MIT | Hugging Face |
| DesignCoder 9B AdamW | 9B | no disponible | 82,14 en bench-200 | MIT | Hugging Face |
| DesignCoder 4B AdamW | 4B | no disponible | 80,06 en bench-200 | MIT | Hugging Face |
| DesignCoder 4B Muon | 4B | no disponible | 71,34 en bench-200 | MIT | Hugging Face |

No se dispone de datos de benchmarks comparables con otros modelos de generacion de UI en la informacion proporcionada, por lo que no es posible establecer una comparativa externa fiable.

## Limitaciones y advertencias

- Las puntuaciones solo son comparables dentro de la misma revision de dataset; mezclar resultados de `data37865` y `data41287` invalida la comparacion.
- El benchmark es propio y esta congelado por el autor; no hay validacion externa ni resultados en suites estandar, lo que limita la comparabilidad con otros modelos.
- Los dashboards degradan el rendimiento de forma notable respecto a las landings, especialmente en modelos pequenos; no es recomendable usar el 4B con Muon para paneles con graficos o flujos de trabajo.
- La diferencia entre 9B y 4B con AdamW no es estadisticamente significativa, por lo que el salto de escala no garantiza mejoras medibles en todos los casos.
- Riesgo de alucinacion en la generacion de codigo y de APIs de terceros: no se documentan mecanismos de mitigacion.
- Sesgos conocidos: no disponibles; al no documentarse la composicion del dataset ni los idiomas, no se puede evaluar el sesgo linguistico o cultural de las interfaces generadas.
- La licencia es MIT, lo que permite uso comercial, pero el autor no ofrece garantias sobre la calidad ni sobre la procedencia de los datos de entrenamiento.
- El repositorio ocupa 340,3 GB, lo que exige planificar el almacenamiento antes de descargar la coleccion completa; conviene descargar solo el checkpoint necesario.
- No se documentan requisitos de contexto, idiomas ni cuantizaciones oficiales, lo que dificulta el dimensionamiento de despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xingxm/DesignCoder
- Artefactos de evaluacion por caso: https://huggingface.co/xingxm/DesignCoder/blob/main/eval/per_case_scores.csv
- Pruebas de significancia V5.9.2: https://huggingface.co/xingxm/DesignCoder/blob/main/eval/significance_tests_v592.json
