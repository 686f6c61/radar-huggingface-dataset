# YONKWd/Spexcon-S1

## Resumen

Spexcon S1 es un proyecto de modelo de lenguaje en fase de desarrollo publicado por el usuario YONKWd en Hugging Face. En su estado actual (v0.2) no contiene pesos de modelo entrenados, sino un andamiaje de desarrollo open source que incluye un pipeline de fine-tuning supervisado configurable, un script de preparación de datasets, configuración de LoRA/QLoRA y un runner de pruebas de humo para entornos GPU limitados. El objetivo declarado es construir un asistente compacto de instrucciones en inglés partiendo del modelo base `Qwen/Qwen3-1.7B-Base`, con licencia Apache-2.0 y compatibilidad comercial.

La relevancia de este repositorio es principalmente metodológica: documenta un flujo completo de fine-tuning con QLoRA sobre un modelo de 1.72B parámetros, pensado para ejecutarse en GPUs gratuitas o de baja capacidad. El propio autor indica que no se ha completado ningún entrenamiento de adaptador con éxito y que no existe una versión final de Spexcon S1. Por tanto, no debe tratarse como un modelo utilizable, sino como una plantilla de experimentación y reproducibilidad para futuros variantes (Spexcon S1 Mini, Code, Reason, etc.).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-1.7B-Base) |
| Parametros totales | 1.72B (modelo base configurado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | QLoRA (4-bit bitsandbytes) para entrenamiento |
| Idiomas soportados | inglés (único idioma declarado) |
| Licencia | Apache-2.0 |
| Formato de pesos | no aplica (no hay pesos publicados) |

## Arquitectura y entrenamiento

El repositorio configura el fine-tuning sobre `Qwen/Qwen3-1.7B-Base`, un transformer denso de la familia Qwen con aproximadamente 1.72B parámetros. El pipeline de entrenamiento utiliza el `SFTTrainer` de TRL junto con PEFT, aplicando LoRA o QLoRA con carga en 4-bit mediante bitsandbytes para reducir el consumo de memoria. El método por defecto es QLoRA supervisado, guardando adaptadores PEFT que posteriormente pueden fusionarse con el modelo base.

El dataset de partida es `HuggingFaceH4/ultrachat_200k`, con licencia MIT, del que se prepara un subconjunto pequeño mediante streaming. El script de preparación aplica filtrado de ejemplos vacíos o rotos, normalización de roles, eliminación básica de duplicados, barajado determinista y división train/eval, con límites de muestra configurables. No se ha ejecutado ningún entrenamiento completo; solo se ha preparado un smoke test v0.3 que aún no ha podido ejecutarse en GPU (Hugging Face Jobs devolvió `402 Payment Required`).

## Capacidades

No existen capacidades verificadas del modelo, ya que no hay pesos entrenados publicados. Las capacidades potenciales declaradas en la documentación del proyecto son:

- Seguimiento de instrucciones generales tras el fine-tuning supervisado.
- Asistencia en escritura y edición.
- Respuestas con estilo de razonamiento tras un entrenamiento adecuado.
- Variantes especializadas por dominio con datasets con licencia apropiada.
- Soporte de tool calling: no disponible (no implementado en la configuración).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (solo inglés declarado).

## Casos de uso

Dado que no existe un modelo entrenado, no hay casos de uso reales aplicables. Los escenarios previstos por el autor para futuras versiones incluyen:

- Investigación en fine-tuning eficiente de modelos compactos con QLoRA en GPU limitadas.
- Experimentación con datasets de instrucciones en inglés y evaluación cualitativa con prompts fijos.
- Desarrollo de variantes especializadas (code, reason) partiendo del mismo andamiaje.
- Reproducibilidad de pipelines de SFT con TRL y PEFT.
- Prototipado de asistentes de chat pequeños para entornos con restricciones de hardware.
- Estudio comparativo de configuraciones de LoRA y QLoRA sobre un mismo base model.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existe ningún modelo entrenado que evaluar.

## Requisitos de hardware

- El proyecto está diseñado para entornos GPU limitados o gratuitos (menciona "free GPU environments").
- El smoke test v0.3 intentó ejecutarse en una T4 GPU mediante Hugging Face Jobs, pero la solicitud fue rechazada por error de pago (`402 Payment Required`).
- Con QLoRA en 4-bit, un modelo de 1.72B parámetros puede caber en GPUs con 8-12 GB de VRAM, aunque no se han reportado mediciones reales.
- Opciones de despliegue: no aplica, no hay pesos que desplegar. El repositorio incluye un script de inferencia de ejemplo, pero sin modelo entrenado no es funcional.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Spexcon S1 no es un modelo publicado, sino un scaffold de desarrollo. No existe una categoría comparable en la que situarlo, y no hay resultados que contrastar con alternativas como Qwen3-1.7B-Instruct u otros modelos de tamaño similar.

## Limitaciones y advertencias

- No hay pesos de modelo finales ni adaptadores entrenados publicados.
- El repositorio es un andamiaje de desarrollo, no un modelo utilizable.
- El smoke test v0.3 no ha podido ejecutarse en GPU; el estado de entrenamiento es inexistente.
- El modelo base Qwen3-1.7B-Base no es un sistema certificado en seguridad; los resultados pueden ser inexactos, sesgados, incompletos o inseguros.
- Cualquier adaptador futuro debe tratarse como experimental y no como un lanzamiento oficial.
- Los usuarios finales deben validar licencias de datasets, calidad de datos, privacidad y resultados de evaluación antes de publicar checkpoints entrenados.
- No hay garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- Repositorio del proyecto: https://huggingface.co/YONKWd/Spexcon-S1
- Modelo base configurado: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Dataset fuente: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Perfil del autor: https://huggingface.co/YONKWd
