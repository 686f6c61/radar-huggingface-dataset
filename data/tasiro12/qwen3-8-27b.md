# TaSiro12/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso de 27,8 mil millones de parametros con capacidad vision-lenguaje nativa, desarrollado por Alibaba como parte de la familia Qwen. Es la generacion mas reciente de la serie Qwen3.8, construida sobre la base arquitectonica de Qwen3.5, e incorpora mejoras sustanciales en codificacion, trabajo profesional, investigacion y tareas agenciales de largo horizonte. Se trata de un modelo causal vision-language que entiende imagenes y videos, con una ventana de contexto nativa de 262.144 tokens extensible hasta 1.000.000, lo que lo hace adecuado para tareas complejas y multi-paso que requieren fiabilidad de extremo a extremo.

El modelo combina una arquitectura hibrida con Gated DeltaNet (atencion lineal) y Gated Attention, junto con un vision encoder, y ha sido entrenado en dos fases: pre-entrenamiento y post-entrenamiento. Su modo de pensamiento flexible, activado por defecto y desactivable por peticion, permite ajustar la profundidad de razonamiento mediante el parametro `reasoning_effort` y conservar el contexto de razonamiento historico con `preserve_thinking`. Con licencia Apache 2.0 y pesos en formato safetensors, es compatible con Transformers, vLLM, SGLang y TokenSpeed, lo que facilita su integracion en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CausalLM hibrido con vision encoder (Gated DeltaNet + Gated Attention + FFN) |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | No aplica (modelo denso) |
