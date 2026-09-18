# Utkarsh736/qwen3.5-0.8b-hindi-jacobian-lens

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un artefacto de interpretabilidad denominado Jacobian lens (lente jacobiana), ajustado específicamente para el modelo `Qwen/Qwen3.5-0.8B` sobre texto de Wikipedia en hindi. Lo publica el usuario Utkarsh736 bajo licencia Apache 2.0 y se distribuye con la librería `transformer_lens`. El artefacto es una aplicación lineal que transporta las representaciones de la corriente residual de capas intermedias hasta la base de la capa final, lo que permite inspeccionar qué distribución de tokens "pretende" generar el modelo en cada punto de su pase hacia delante.

A diferencia del Logit Lens, que asume que las representaciones intermedias ya viven en el espacio geométrico de la capa final, la lente jacobiana corrige de forma explícita el desplazamiento representacional entre capas. El ajuste se realizó sobre 150 pasajes de Wikipedia en hindi (config `hi` de `HuggingFaceFW/finewiki`), con una longitud máxima de secuencia de 128 tokens y un `dim_batch` de 64, y se guarda como un artefacto de aproximadamente 48 MB en precisión float32. El modelo base sobre el que se ajusta es un transformer decodificador causal de 24 capas y `d_model` 1024.

Su relevancia es doble: por un lado forma parte de un experimento en curso sobre sesgo multilingüe orientado al benchmark BharatBBQ; por otro, el propio autor lo marca como experimental y no validado, ya que la comprobación de cordura produjo lecturas degeneradas (signos de puntuación como tokens dominantes). Debe tratarse, por tanto, como una prueba de pipeline y no como una herramienta de interpretabilidad fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lente jacobiana (aplicación lineal) sobre un transformer decodificador causal; modelo base con 24 capas y `d_model` 1024 |
| Parametros totales | 0,8 B en el modelo base (`Qwen/Qwen3.5-0.8B`); el artefacto de la lente ocupa ~48 MB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de secuencia usada en el ajuste); contexto del modelo base: no disponible |
| Tipos de cuantizacion | no aplica; el artefacto se guarda en float32 |
| Idiomas soportados | hindi (`hi`); el ajuste se realizó exclusivamente sobre texto en hindi |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, `qwen3.5_0.8b_hindi_lens.pt`) más un manifiesto de prompts en JSONL (`hindi_prompts.jsonl`) |

## Arquitectura y entrenamiento

El artefacto es una lente jacobiana, es decir, una aplicación lineal entrenada para aproximar la transformación que experimentan las representaciones internas entre una capa concreta y la capa final del modelo. Se ajusta para el checkpoint exacto `Qwen/Qwen3.5-0.8B`, un transformer decodificador causal de 24 capas y `d_model` 1024. El ajuste se llevó a cabo con la librería `transformer_lens`, empleando `TransformerBridge` para arrancar el modelo y `JacobianLens` para el ajuste propiamente dicho. La innovación metodológica frente al Logit Lens es que la lente jacobiana modela explícitamente el desplazamiento representacional entre capas, en lugar de suponer que las representaciones intermedias ya se expresan en la base de la capa final.

En cuanto a los datos, se usaron 150 pasajes de Wikipedia en hindi procedentes de `HuggingFaceFW/finewiki` (config `hi`, split `train`, en streaming), cada uno de al menos 600 caracteres. La longitud máxima de secuencia fue de 128 tokens, con un `dim_batch` de 64 y precisión float32 durante el ajuste. El hardware empleado fue una RTX Pro 6000 Blackwell de 96 GB en el entorno molab (marimo). No se documenta ningún proceso de RLHF ni DPO, algo que no aplica a este tipo de artefacto de interpretabilidad. El manifiesto exacto de prompts queda registrado con su SHA256 en los metadatos de la lente.

## Capacidades

- Transporte de representaciones: proyecta las representaciones de la corriente residual de capas intermedias hacia la base de la capa final del modelo base.
- Lectura por capa y posición: permite consultar la distribución de tokens "intencionada" en capas y posiciones concretas mediante `lens.readout(...)`.
- Inspección del espacio de trabajo interno: facilita estudiar cómo evoluciona la representación a lo largo del pase hacia delante al procesar texto en hindi.
- Investigación de sesgo multilingüe: diseñada para aplicarse a prompts en hindi del benchmark BharatBBQ y observar si los tokens congruentes con estereotipos emergen con mayor frecuencia que los contrarios.
- No genera texto: es una herramienta de análisis, no un modelo de generación.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades de visión ni audio.
- Sin modo "thinking" ni funcionalidades especiales de inferencia.

## Casos de uso

- Investigación de interpretabilidad mecánica sobre `Qwen/Qwen3.5-0.8B`: la lente permite examinar cómo se transforman las representaciones internas capa a capa cuando el modelo procesa hindi, un caso poco cubierto por las lentes publicadas, mayoritariamente en inglés.
- Experimentos de sesgo multilingüe con BharatBBQ: el objetivo declarado es aplicar la lente a prompts en hindi de este benchmark y comprobar si los tokens estereotípicos aparecen en el espacio de trabajo interno con más frecuencia que los contra-estereotípicos.
- Prueba de pipeline de ajuste de lentes jacobianas: sirve como caso de test para validar el flujo `TransformerBridge` + `JacobianLens` antes de ajustes más costosos sobre modelos mayores.
- Comparación metodológica Jacobian Lens frente a Logit Lens: al disponer de lecturas por capa, permite contrastar ambas técnicas y cuantificar la corrección que aporta la lente jacobiana.
- Auditoría de representaciones internas en hindi: útil para detectar en qué capas el modelo concentra información semántica relevante para este idioma.
- Reproducción de experimentos: el manifiesto `hindi_prompts.jsonl` con SHA256 registrado permite reconstruir exactamente el conjunto de prompts empleado en el ajuste.
- Docencia y estudio de técnicas de interpretabilidad: como ejemplo didáctico de cómo se ajusta y se consulta una lente, especialmente por lo instructivo de sus resultados degenerados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación es la comprobación de cordura incluida en la model card, aplicada al prompt en hindi `भारत की राजधानी है` ("la capital de India es"), cuyo resultado se consideró degenerado:

| Capa | Tokens principales observados |
|---|---|
| 12 | `?`, ` ?`, `ै`, ` ??`, ` !` |
| 18 | `?`, ` ?`, `?!`, `??`, ` ??` |
| 23 | `?`, `\n`, ` ?`, `ल`, `र` |

Se esperaba que las capas finales convergiesen hacia tokens relacionados con "Delhi" o "capital". La capa final (23) siempre se lee con transporte identidad, por lo que su lectura debería coincidir con la distribución real de salida del modelo; obtener signos de puntuación sugiere un problema de arranque del modelo, de tokenización o un ajuste inestable.

## Requisitos de hardware

- Hardware de ajuste documentado: RTX Pro 6000 Blackwell de 96 GB en molab (marimo), con el modelo en float32.
- Inferencia del modelo base: el ejemplo de uso exige arrancar `Qwen/Qwen3.5-0.8B` en float32 con `TransformerBridge`, lo que requiere del orden de 3-4 GB solo para los pesos (estimación derivada de 0,8 B de parámetros y 4 bytes por parámetro).
- VRAM total estimada para usar el conjunto (modelo base + lente): aproximadamente 5-8 GB, sumando pesos en float32, activaciones y el artefacto de ~48 MB (estimación).
- GPU de consumo: cabe con holgura en tarjetas con 8 GB o más de VRAM, como RTX 3060 Ti, RTX 4060, RTX 3070 o superiores; en 6 GB podría ser justo en float32 (estimación).
- Opciones de despliegue: el artefacto depende de `transformer_lens` (`TransformerBridge` + `JacobianLens`); no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no se trata de un modelo generativo con pesos estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se conocen otras lentes jacobianas publicadas para el mismo modelo base en la informacion disponible. La comparación más pertinente es metodológica, frente al Logit Lens:

| Criterio | Jacobian lens (este artefacto) | Logit Lens |
|---|---|---|
| Tipo | Aplicación lineal ajustada | Proyección directa sin ajuste |
| Modelo objetivo | `Qwen/Qwen3.5-0.8B` (vinculante) | Cualquier transformer, sin ajuste específico |
| Coste de ajuste | Requiere corpus y cómputo (150 prompts, float32) | Nulo |
| Corrección entre capas | Sí, modela el desplazamiento representacional | No, asume la base de la capa final |
| Idioma del ajuste | Hindi | Independiente del idioma |
| Licencia | Apache 2.0 | No aplica |
| Estado | Experimental y no validado | Técnica consolidada |

## Limitaciones y advertencias

- Vinculación al modelo: la lente solo es matemáticamente válida para el checkpoint exacto `Qwen/Qwen3.5-0.8B`; aplicarla a otro modelo, aunque comparta arquitectura, produce resultados inválidos.
- Vinculación al idioma: fue ajustada sobre texto de Wikipedia en hindi; usarla con inglés, bengalí u otro idioma genera lecturas ruidosas o engañosas.
- Aproximación lineal: al ser una aproximación lineal de un sistema no lineal, no captura decisiones abruptas o discontinuas; las lecturas deben interpretarse como una señal ruidosa, no como verdad de referencia.
- Ajuste reducido: 150 prompts está en el extremo bajo de lo recomendado (las lentes publicadas suelen emplear hasta 1.000 prompts), por lo que la calidad podría mejorar con un ajuste mayor.
- Sin validar: la comprobación de cordura produjo salidas degeneradas (puntuación como token dominante incluso en la capa final), lo que apunta a un problema de arranque, tokenización o inestabilidad del ajuste.
- Riesgo de conclusiones erróneas: dado su estado experimental, no debería sustentar afirmaciones sobre sesgo o comportamiento interno del modelo sin una validación previa.
- Uso comercial: la licencia Apache 2.0 lo permitiría, pero la utilidad práctica está limitada por su falta de validación y por su naturaleza de artefacto de investigación.
- Búsqueda web: las búsquedas realizadas no devolvieron resultados relevantes sobre este artefacto ni sobre su autor (los resultados obtenidos correspondían a entidades homónimas sin relación).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Utkarsh736/qwen3.5-0.8b-hindi-jacobian-lens
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de ajuste: https://huggingface.co/datasets/HuggingFaceFW/finewiki
- Artículo de metodología (Transformer Circuits, Workspace, 2026): https://transformer-circuits.pub/2026/workspace/index.html
- Implementación de referencia: https://github.com/anthropics/jacobian-lens
- Cita BibTeX incluida en la model card: `@article{transformer-circuits-workspace-2026, title={Workspace}, author={Transformer Circuits}, year={2026}, url={https://transformer-circuits.pub/2026/workspace/index.html}}`
