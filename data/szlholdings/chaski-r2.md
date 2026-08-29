# SZLHOLDINGS/chaski-r2

## Resumen

SZLHOLDINGS/chaski-r2 es un identificador reservado en Hugging Face que no contiene un modelo entrenado. Según la model card oficial, se trata de un "reserved SKU" y explícitamente se indica "not a checkpoint" y "WEIGHTS UNAVAILABLE". No existe ningún archivo de pesos (ni safetensors ni GGUF) asociado a este repositorio, y la propia documentación advierte que no se debe intentar cargar con `from_pretrained`. El artefacto se describe como una "RECIPE" (receta de entrenamiento) dentro del marco de gobernanza de SZL Holdings, con una referencia a un script `train_chaski_r2.py` que sería un job recipe, no un adaptador entrenado.

La organización SZL Holdings se presenta como una infraestructura de IA gobernada con doctrina v11, pero este repositorio concreto no ofrece ningún modelo utilizable. La base mencionada en prosa es `Qwen/Qwen3.5-0.8B`, aunque no hay confirmación de que se haya realizado ningún entrenamiento. En resumen, no es un modelo de IA, sino un marcador de posición o un artefacto de proceso interno. Cualquier desarrollador que encuentre este ID debe saber que no hay nada que descargar ni ejecutar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un checkpoint) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no hay pesos) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no hay archivos de pesos) |

## Arquitectura y entrenamiento

No hay información sobre arquitectura ni entrenamiento porque el repositorio no contiene un modelo. La model card menciona una base teórica `Qwen/Qwen3.5-0.8B` en prosa, pero no se aporta ningún detalle sobre datos de entrenamiento, número de tokens, técnicas de alineación (RLHF, DPO) ni innovaciones técnicas. El artefacto se clasifica como `artifact_class: RECIPE`, lo que sugiere que es una especificación de un proceso de entrenamiento, no el resultado de uno. No se ha publicado ningún log de entrenamiento, métricas ni evaluación.

## Capacidades

- No se ha publicado ninguna capacidad funcional. El repositorio no contiene pesos, por lo que no es posible generar texto, razonar, ejecutar tool calling ni ninguna otra tarea de IA.
- No hay soporte de agentes, visión, audio ni modos de pensamiento.
- No se ha verificado ninguna capacidad multilingüe.

## Casos de uso

- No aplica. Este identificador no es un modelo desplegable. No se puede utilizar en ningún escenario práctico de inferencia, generación de código, atención al cliente, análisis de datos, etc.
- Cualquier intento de integración en un pipeline de producción fallará porque no existen pesos que cargar.
- El único uso posible es como referencia interna dentro del ecosistema SZL Holdings, pero no para desarrolladores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica `evals: none-this-run` y `publication_eligible: false`. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica.

## Requisitos de hardware

- No aplica. No hay modelo que ejecutar, por lo que no se requieren GPU, VRAM ni infraestructura de inferencia.
- No se ha especificado ninguna opción de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) para este identificador.
- No hay estimaciones de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable porque este repositorio no contiene un modelo. Las alternativas reales de la misma categoría (modelos pequeños tipo Qwen3.5-0.8B) están disponibles en Hugging Face, pero no son comparables con un SKU reservado sin pesos.

## Limitaciones y advertencias

- No es un modelo utilizable: no contiene pesos ni artefactos de inferencia.
- La model card advierte explícitamente: "Do not `from_pretrained` this ID". Intentar cargarlo producirá un error.
- No hay garantías de que el identificador se convierta en un modelo en el futuro; la etiqueta `reserved-sku` sugiere que es un marcador de posición.
- La licencia Apache-2.0 se aplica al repositorio, pero no a ningún peso (porque no existen).
- No se debe confundir con otros repositorios de la misma organización como `SZLHOLDINGS/chaski` o `SZLHOLDINGS/chaski-5050`, que también podrían ser no funcionales.
- Para producción, es imprescindible verificar que un modelo tenga pesos reales y evaluación publicada antes de considerarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/chaski-r2
- Organización SZL Holdings en Hugging Face: https://huggingface.co/SZLHOLDINGS/models
- GitHub de SZL Holdings: https://github.com/szl-holdings
- Documentación de SZL Holdings: https://holdings.a-11-oy.com/docs-site/about.html
- Repositorio szl-serve (receta de servicio): https://github.com/szl-holdings/szl-serve/blob/main/README.md
- Sitio web de Chaski AI (no relacionado directamente): https://chaski.ai/
