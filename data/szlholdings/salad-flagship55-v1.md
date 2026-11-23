# SZLHOLDINGS/salad-flagship55-v1

## Resumen

`SZLHOLDINGS/salad-flagship55-v1` es un adaptador LoRA (fine-tune) publicado por SZLHOLDINGS como artefacto privado de su "estate flagship", correspondiente a la ejecución número 55 de su pipeline interno. No es un modelo autónomo: según la propia model card, requiere el modelo base `SZLHOLDINGS/SZL-Nemotron-Mini-4B-Estate-v1` y se carga mediante `peft.PeftModel.from_pretrained` sobre la subcarpeta `final` del repositorio. El repositorio pesa 10,1 GB y contiene pesos en formato safetensors.

La model card se presenta explícitamente como un "recibo medido de anuncio de lane" y no como una página de producto. En el momento de la última actualización (22 de noviembre de 2026) el estado declarado es `UNKNOWN_NO_EVAL_RECEIPT`: no se han encontrado los ficheros de recibo estándar (`eval/frontier-v1/DONE.json`, `final/train_receipt.json`) y no se formula ninguna afirmación de calidad. La información técnica disponible es, por tanto, mínima y deliberadamente escasa.

El interés de esta ficha es fundamentalmente documental: ilustra un patrón de publicación de artefactos de entrenamiento con gobernanza estricta (recibos encadenados por hash, fail-closed, elegibilidad de publicación desactivada) en el que la ausencia de evaluación se declara de forma explícita en lugar de rellenarse con cifras orientativas. Para un desarrollador o investigador que evalúe modelos, el artefacto no es utilizable como modelo de producción en su estado actual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card indica que el modelo base es de arquitectura `nemotron`; el adaptador hereda la del base) |
| Parámetros totales | no disponible (el nombre del modelo base sugiere ~4B, no confirmado en la información disponible) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA en la subcarpeta `final`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de ajuste fino (PEFT) que se monta sobre el modelo base `SZLHOLDINGS/SZL-Nemotron-Mini-4B-Estate-v1`. La model card menciona que la ruta de código del snippet de inicio rápido se validó para la arquitectura `nemotron`, pero no describe la arquitectura del adaptador ni del base más allá de esa referencia nominal. No se especifican dimensiones del transformer, tipo de atención, número de capas ni configuración de expertos.

Respecto a los datos de entrenamiento, la card enlaza un dataset compañero, `SZLHOLDINGS/flagship55-sft-v1`, creado el 17 de noviembre de 2026, pero no documenta su composición, número de tokens, proporción de datos sintéticos ni si hubo etapas de RLHF o DPO. La única medición declarada es la pérdida de entrenamiento por paso. El estado del grupo de entrenamiento `szl-train-flagship55-v1` se registra como "booting" en el censo del 17 de noviembre de 2026, y la card afirma que no existen artefactos de entrenamiento ni mediciones en el repositorio en ese momento. No se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto condicionada por una plantilla de chat, según el snippet de inicio rápido de la model card.
- Integración con `transformers` 5.x mediante `apply_chat_template` con `return_dict=True`.
- Carga como adaptador PEFT sobre el modelo base indicado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Evaluación funcional: no realizada con los pesos de este repositorio; la prueba de humo documentada usó un modelo de la misma arquitectura inicializado aleatoriamente y reducido, sin descargar pesos.

## Casos de uso

- Auditoría de artefactos de gobernanza: el repositorio sirve como ejemplo de publicación con recibos encadenados por hash y estado fail-closed; un equipo de plataforma puede estudiarlo para diseñar su propio esquema de recibos de entrenamiento y evaluación.
- Reproducción de pipelines PEFT: el snippet de la card permite verificar el flujo de carga de adaptadores sobre un base `nemotron` en `transformers` 5.x, útil para validar integraciones de `peft` antes de desplegar adaptadores propios.
- Pruebas de integración de plantillas de chat: dado que la card documenta el cambio de API de `apply_chat_template` (devuelve `BatchEncoding`), puede usarse como caso de regresión en suites de compatibilidad de versiones.
- Verificación de contratos de evaluación: el estado `UNKNOWN_NO_EVAL_RECEIPT` y la ruta de la ledger de bloqueo (`szl-holdings/szl-eval-harness ledger/blocking_ledger_v1.json`) permiten probar herramientas que detectan artefactos sin evaluación antes de promoverlos.
- Estudio de monetización con pasarela de pago: la card menciona una lane de inferencia gobernada con pago x402 sobre Cloudflare (`inference.a-11-oy.com`), útil como referencia arquitectónica para despliegues con control de acceso y facturación por petición.
- Docencia sobre limitaciones en model cards: el contraste entre el tamaño del repositorio (10,1 GB) y la ausencia total de métricas es un caso práctico para enseñar a distinguir artefactos de entrenamiento de modelos listos para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que MMLU-Pro, GPQA, IFEval y BFCL no han sido evaluados, y que las suites de seguridad (toxicidad, jailbreak, red-team) tampoco se han ejecutado. El estado del recibo de evaluación es `UNKNOWN_NO_EVAL_RECEIPT`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base (`SZLHOLDINGS/SZL-Nemotron-Mini-4B-Estate-v1`), cuyos requisitos no se documentan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el único método documentado es `transformers` + `peft` en Python; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La única prueba registrada se ejecutó en CPU con `torch 2.15.0` y un modelo reducido inicializado aleatoriamente, sin medición de rendimiento.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores LoRA sobre bases tipo Nemotron Mini) ni datos de rendimiento que permitan establecer una comparación cuantitativa. La model card tampoco cita alternativas.

## Limitaciones y advertencias

- El repositorio contiene únicamente pesos de adaptador; no es un modelo autónomo y no funciona sin el base `SZLHOLDINGS/SZL-Nemotron-Mini-4B-Estate-v1`.
- Artefacto privado del estate de SZL Holdings: la card indica que no es para descarga pública y que los repositorios privados o con gating requieren `hf auth login`.
- Cero evaluaciones estándar ejecutadas: MMLU-Pro, GPQA, IFEval y BFCL no están medidos.
- Cero evaluaciones de seguridad: no hay datos de toxicidad, jailbreak ni red-team.
- La prueba de humo documentada no usó los pesos del repositorio; no hay evidencia de calidad de salida.
- `publication_eligible: false` hasta que el propietario tome una decisión de evaluación.
- Licencia no declarada: no se puede determinar si el uso comercial está permitido.
- Idiomas soportados no declarados: riesgo de comportamiento inconsistente fuera del idioma de entrenamiento, que se desconoce.
- Riesgo de alucinación: no cuantificado; sin evaluación, no puede descartarse.
- Sesgos conocidos: no documentados.
- La card advierte de un cambio de API en `transformers` 5.x (`apply_chat_template` devuelve `BatchEncoding`); el código antiguo basado en `ids.shape[1]` falla con `AttributeError`.
- El estado del recibo de evaluación es `UNKNOWN_NO_EVAL_RECEIPT`; si existen recibos en rutas no estándar, su propietario es quien debe aportarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-flagship55-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/SZL-Nemotron-Mini-4B-Estate-v1
- Dataset compañero: https://huggingface.co/datasets/SZLHOLDINGS/flagship55-sft-v1
- Hogar de evidencias: https://huggingface.co/datasets/SZLHOLDINGS/frontier-55-runs
- Recibos de la ejecución anterior: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Organización en GitHub: https://github.com/szl-holdings
- Front-end: https://szl-holdings.github.io
- Lane de inferencia gobernada: https://inference.a-11-oy.com
