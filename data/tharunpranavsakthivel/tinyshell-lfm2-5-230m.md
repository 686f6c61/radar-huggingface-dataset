# tharunpranavsakthivel/tinyshell-lfm2.5-230m

## Resumen

`tinyshell-lfm2.5-230m` es un modelo de lenguaje compacto, desarrollado por tharunpranavsakthivel, que consiste en un fine-tune supervisado del modelo base `LiquidAI/LFM2.5-230M` de Liquid AI. Su propósito específico es convertir instrucciones en lenguaje natural en representaciones intermedias estructuradas (JSON) para el sistema TinyShell ShellIntent, un dominio de automatización de tareas de shell. El modelo resuelve el problema de traducir comandos ambiguos o de alto nivel en acciones ejecutables, clasificando la intención en tres decisiones principales: `compile`, `clarify` o `unsupported`.

La relevancia actual de este modelo radica en su tamaño ultrarreducido (230 millones de parámetros) y su arquitectura híbrida de convolución y atención (LFM2), lo que lo hace adecuado para despliegue en dispositivos periféricos (edge) con presupuestos de memoria y cómputo muy limitados. Según la documentación de Liquid AI, el modelo base soporta una ventana de contexto de 32 000 tokens y capacidades de tool calling, lo que se hereda en este fine-tune. La licencia es la LFM Open License v1.0, que permite uso comercial sujeto a un umbral de ingresos anuales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 híbrida (convolución + atención) |
| Parametros totales | 229 693 184 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 000 tokens (según documentación de Liquid AI) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | Inglés |
| Licencia | LFM Open License v1.0 (con umbral de ingresos para uso comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune supervisado del `LiquidAI/LFM2.5-230M`, que a su vez es la variante más pequeña de la familia LFM2.5 de Liquid AI. La arquitectura base combina capas de convolución con mecanismos de atención (backbone híbrido conv+attention), diseñada para maximizar la eficiencia en dispositivos con recursos limitados. El modelo base fue destilado desde el LFM2.5-350M y optimizado para tool calling y extracción de datos.

El entrenamiento del fine-tune se realizó mediante modelado de lenguaje causal supervisado (SFT), utilizando 1600 ejemplos de entrenamiento, 200 de validación y 200 de prueba (held-out). Los tokens del prompt se enmascararon de la pérdida y solo la respuesta JSON del asistente se usó como objetivo supervisado. La semilla aleatoria fue 42, la mejor pérdida de validación alcanzó 0.0986, y el tiempo total de entrenamiento fue de aproximadamente 828 segundos con un pico de memoria GPU de 4.32 GB. No se emplearon técnicas como RLHF o DPO; el ajuste es puramente supervisado.

## Capacidades

- Generación de JSON estructurado: convierte instrucciones en lenguaje natural en objetos JSON que siguen el esquema TinyShell ShellIntent.
- Clasificación de decisiones de alto nivel: distingue entre `compile` (ejecutar), `clarify` (pedir aclaración) y `unsupported` (no soportado).
- Soporte de tool calling / function calling: heredado del modelo base, permite integrar el modelo en pipelines que requieren invocación de herramientas.
- Generación conversacional: puede mantener diálogos multi-turno para aclarar intenciones ambiguas.
- Capacidades multilingües: no disponible; el modelo está entrenado únicamente en inglés.
- Modo de generación controlada: termina la generación tras completar el primer objeto JSON de nivel superior, evitando contenido adicional no deseado.

## Casos de uso

- Automatización de tareas de shell: el modelo puede traducir comandos en lenguaje natural (p. ej., "comprime todos los archivos .log de esta carpeta") en una representación estructurada que un compilador determinista convierte en comandos ejecutables. Su tamaño reducido permite ejecutarlo en un agente local sin depender de la nube.
- Asistentes de línea de comandos inteligentes: integrado en un terminal, el modelo interpreta solicitudes del usuario y genera la acción correspondiente, solicitando aclaraciones cuando la instrucción es ambigua (decisión `clarify`).
- Extracción de intenciones en sistemas de automatización: sirve como componente de parsing semántico para convertir entradas de texto en representaciones intermedias (IR) que otros sistemas consumen, por ejemplo en pipelines de CI/CD para tareas de compilación o despliegue.
- Generación de JSON para agentes conversacionales: al ser un modelo de texto con tool calling, puede actuar como generador de argumentos para funciones externas en asistentes de voz o chatbots, siempre que se valide la salida contra el esquema.
- Prototipado de aplicaciones edge: gracias a su bajo consumo de memoria (230M parámetros), es viable en dispositivos como Raspberry Pi o teléfonos móviles para tareas de procesamiento de lenguaje natural locales, sin conexión a internet.
- Evaluación de riesgos en comandos: el modelo clasifica la operación solicitada y asigna un nivel de riesgo, lo que permite implementar políticas de seguridad que requieran confirmación del usuario antes de ejecutar acciones potencialmente peligrosas.

## Benchmarks y rendimiento

Los resultados de evaluación sobre el conjunto de prueba held-out se presentan en la tabla siguiente. No se han publicado comparativas con otros modelos en la información disponible.

| Metrica | Resultado |
|---|---|
| JSON parse rate | 99.00 % |
| Schema validity | 96.00 % |
| IR exact match | 37.50 % |
| Decision accuracy | 96.00 % |
| Operation accuracy | 64.50 % |
| Slot precision | 70.31 % |
| Slot recall | 61.66 % |
| Slot F1 | 65.70 % |
| Risk accuracy | 95.50 % |
| Confirmation accuracy | 96.00 % |
| Clarify accuracy | 100.00 % |
| Unsupported accuracy | 60.00 % |
| Multi-operation accuracy | 31.11 % |
| Mediana de latencia de inferencia | 1260.43 ms |

Estos resultados indican un alto rendimiento en la clasificación de decisiones y en la generación de JSON válido, pero una exactitud baja en el emparejamiento exacto de la representación intermedia (37.5 %), lo que refleja la estrictez del criterio de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no se han publicado cifras oficiales. Dado el tamaño de 230M parámetros, en FP16 la huella de memoria rondaría los 460 MB, y en int8 aproximadamente 230 MB, lo que permite ejecución en GPUs consumer con 2 GB o menos.
- GPU recomendadas: no hay especificación oficial; el modelo está diseñado para edge, por lo que puede ejecutarse en CPUs, Raspberry Pi y GPUs de gama baja (p. ej., NVIDIA Jetson, GTX 1050 Ti).
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU moderna con al menos 1 GB de VRAM.
- Opciones de despliegue: al ser un modelo de la familia LFM2.5, es compatible con vLLM, llama.cpp, Ollama y TGI, según la documentación de Liquid AI. No se confirma explícitamente para este fine-tune, pero la base sí lo es.
- Latencia y throughput: la mediana de latencia medida en el entorno de evaluación es de 1260 ms, aunque este valor depende del hardware utilizado y no se detalla en la documentación.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoría. El modelo base `LiquidAI/LFM2.5-230M` es el punto de referencia natural, pero no se han aportado resultados comparativos en la información disponible. Por tanto, esta sección queda sin datos concretos.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al estar entrenado solo en inglés, su uso en otros idiomas producirá resultados incorrectos.
- Riesgo de alucinación: como todo modelo generativo, puede producir salidas plausibles pero incorrectas; la exactitud de la IR es baja (37.5 % en emparejamiento exacto), lo que exige validación externa.
- Limitaciones de contexto: aunque el modelo base soporta 32K tokens, este fine-tune no ha sido evaluado con contextos largos; se recomienda no exceder el límite del esquema ShellIntent.
- Restricciones de licencia: la LFM Open License v1.0 impone un umbral de ingresos anuales para uso comercial; superado dicho umbral, se requiere una licencia comercial de Liquid AI.
- Caveat de producción: la salida del modelo es "intención no confiable"; no debe ejecutarse directamente. Es obligatorio validar el JSON contra el esquema TinyShell, compilarlo mediante un compilador determinista y aplicar comprobaciones de seguridad y confirmación del usuario.
- El entrenamiento se realizó con una única semilla, por lo que los resultados pueden no ser representativos de la variabilidad entre entrenamientos.

## Enlaces

- [HuggingFace del modelo fine-tune](https://huggingface.co/tharunpranavsakthivel/tinyshell-lfm2.5-230m)
- [HuggingFace del modelo base](https://huggingface.co/LiquidAI/LFM2.5-230M)
- [Blog de Liquid AI sobre LFM2.5-230M](https://www.liquid.ai/blog/lfm2-5-230m)
- [Documentación oficial de LFM2.5-230M](https://docs.liquid.ai/lfm/models/lfm25-230m)
- [Receta de vLLM para LFM2.5-230M](https://recipes.vllm.ai/LiquidAI/LFM2.5-230M)
- [Licencia LFM Open License v1.0](https://www.liquid.ai/lfm-license)
