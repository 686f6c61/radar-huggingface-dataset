# SZLHOLDINGS/waman

## Resumen

El modelo `SZLHOLDINGS/waman` es un artefacto publicado en Hugging Face por la organización SZL Holdings, pero no es un checkpoint de un modelo de inteligencia artificial. Según su propia model card, se trata de un "roadmap organ" dentro de la línea "killinchu", es decir, un marcador de posición o placeholder para una futura iteración de un modelo. No contiene pesos, no es un modelo entrenado y no puede ejecutarse para ninguna tarea de inferencia.

La publicación forma parte de la estrategia de SZL Holdings de construir infraestructura de "IA gobernada" (governed AI), con documentación explícita sobre el estado de sus desarrollos. En este caso, el repositorio declara explícitamente que no hay pesos ("Weights: none") y que el "asiento vacío" se publica a propósito, como parte de un linaje de modelos planificado. La licencia es Apache-2.0, pero al no existir artefactos, la licencia es meramente declarativa.

La relevancia de esta ficha es principalmente documental: sirve para entender que no todo lo publicado en Hugging Face es un modelo utilizable, y que algunas organizaciones utilizan el hub como repositorio de metadatos y hojas de ruta. Para desarrolladores e investigadores, este repositorio no ofrece ningún recurso práctico de inferencia, pero sí información sobre la dirección técnica de SZL Holdings.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo, no hay arquitectura) |
| Parametros totales | no disponible (sin pesos) |
| Parametros activos | no disponible (sin pesos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no hay pesos) |

## Arquitectura y entrenamiento

No existe arquitectura ni entrenamiento. El repositorio no contiene ningún archivo de pesos, configuración de modelo, tokenizador o código de inferencia. La model card indica que es un "roadmap organ" y que "no es un checkpoint". No hay datos sobre tokens de entrenamiento, datasets, ni técnicas como RLHF o DPO. La organización SZL Holdings menciona en su documentación pública (GitHub y sitio web) un enfoque de "IA gobernada" con explicabilidad, puntuaciones de confianza y cadenas de evidencia, pero esto no se materializa en este repositorio concreto.

## Capacidades

- No tiene capacidades de generación de texto, razonamiento, código, matemáticas, visión ni ninguna otra tarea de IA.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No existe ningún modo de pensamiento, visión o audio.
- El único contenido es la propia model card, que describe el propósito del repositorio como placeholder de un linaje de modelos.

## Casos de uso

- No existen casos de uso prácticos para este repositorio, ya que no contiene un modelo ejecutable.
- Podría utilizarse como referencia interna para el seguimiento de la hoja de ruta de SZL Holdings, pero no para ninguna aplicación de IA.
- Un desarrollador que busque un modelo para integración en producción no encontrará aquí nada utilizable.
- El repositorio podría servir como ejemplo de cómo documentar la ausencia de artefactos en un hub público, pero no como recurso técnico.
- No es adecuado para atención al cliente, generación de código, análisis de datos, traducción, resumen, ni ningún otro escenario de inferencia.
- Cualquier intento de descargar o cargar este repositorio como modelo fallará por falta de archivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existe ningún modelo que evaluar, por lo que no hay métricas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- No aplica: no hay pesos que cargar ni inferencia que ejecutar.
- No se requiere VRAM, GPU ni CPU para este repositorio.
- No hay opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) porque no existe modelo.
- No hay latencia ni throughput que medir.

## Comparativa con modelos similares

No disponible. No existe ningún modelo comparable porque este repositorio no contiene un modelo. Las alternativas de la misma categoría (modelos de lenguaje de tamaño similar) no son aplicables. La única comparación posible sería con otros repositorios placeholder de la misma organización, como el mencionado "qantu" en la model card, pero no se dispone de información detallada sobre esos repositorios.

## Limitaciones y advertencias

- No contiene pesos: es imposible utilizarlo para cualquier tarea de IA.
- La model card declara explícitamente "No weights" como única limitación.
- La organización indica que los números de la tarjeta son "ROADMAP" y no mediciones reales; no hay datos de energía, rendimiento ni unicidad verificados.
- La licencia Apache-2.0 se aplica al contenido del repositorio (la documentación), pero no a un modelo inexistente.
- No hay garantía de que este repositorio evolucione a un modelo real; es un marcador de posición.
- Para producción, este repositorio es irrelevante y no debe considerarse como una opción de despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/waman
- Perfil de la organización SZL Holdings en Hugging Face: https://huggingface.co/SZLHOLDINGS/models
- Búsqueda de modelos con tag szl-holdings: https://huggingface.co/models?other=szl-holdings
- Documentación de la plataforma SZL en GitHub: https://github.com/szl-holdings/szl-holdings-platform/blob/main/docs/PLATFORM_OVERVIEW.md
- Página "About" de SZL Holdings: https://holdings.a-11-oy.com/docs-site/about.html
- Publicación en LinkedIn de Stephen Lutar (fundador): https://www.linkedin.com/posts/stephen-lutar-279315240_agenticai-artificialintelligence-businessobservability-activity-7453957835303989248-UXze
