# ZODOGAVAJD/fundednext-equity-scaling-algorithm-propfirmw

## Resumen

El repositorio `ZODOGAVAJD/fundednext-equity-scaling-algorithm-propfirmw`, publicado por el usuario ZODOGAVAJD, no contiene un modelo de lenguaje ni un modelo de IA en sentido estricto. Se trata de un artefacto de marketing y afiliación disfrazado de "modelo" en Hugging Face, cuyo contenido es un plan de escalado de capital para cuentas de evaluación de una prop firm (FundedNext), acompañado de enlaces de afiliado y un código promocional ("PROPFIRMW").

La model card describe un "modelo de progresión multi-nivel de capital" que simula la capitalización de un saldo de cuenta hasta 4.000.000 de dólares con incrementos periódicos del 40%. No se aporta ninguna arquitectura de red neuronal, ningún conjunto de datos de entrenamiento, ningún tokenizador ni pesos en ningún formato. Los tags del repositorio (`scaling-plan`, `capital-allocation`, `prop-firm`, `fundednext`) confirman que el contenido es financiero/comercial, no técnico de IA.

Por tanto, esta ficha no puede evaluar capacidades de generación de texto, razonamiento o código, porque el artefacto no las tiene. Se documenta lo que hay, se señalan las especificaciones ausentes y se advierte de que el uso de este repositorio como "modelo" en un pipeline de IA no es viable. Su relevancia actual es nula desde el punto de vista técnico; su interés es exclusivamente como ejemplo de contaminación del ecosistema Hugging Face con contenido promocional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un "modelo de progresión multi-nivel de capital") |
| Parametros totales | no disponible (no existen pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio no contiene safetensors, GGUF ni ningún otro formato de pesos) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal. El artefacto consiste en una model card en Markdown que describe un esquema de escalado de capital: una simulación de crecimiento del saldo de una cuenta de trading con incrementos del 40% por ciclo hasta alcanzar 4.000.000 de dólares. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o cualquier otra técnica de alineación, porque no existe entrenamiento alguno.

Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas. Los metadatos de Hugging Face indican pipeline "no disponible", cero descargas y cero likes en el momento de la consulta, lo que es coherente con un repositorio sin contenido utilizable como modelo.

## Capacidades

- No tiene capacidades de generación de texto, razonamiento, código ni matemáticas: no hay pesos ni tokenizador.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No dispone de modo "thinking", visión, audio ni ninguna otra modalidad.
- La única "capacidad" declarada es la simulación descriptiva de un plan de escalado de capital con incrementos del 40% hasta 4.000.000 de dólares, que no se implementa en código dentro del repositorio.

## Casos de uso

- Ninguno como modelo de IA: no se puede desplegar en vLLM, llama.cpp, Ollama ni TGI porque no existen pesos.
- Consulta documental del esquema de escalado: un lector podría leer la model card para conocer la propuesta de progresión de capital descrita, aunque no hay código que la implemente.
- Ejemplo de mala práctica en Hugging Face: útil para estudiar cómo se cuelan artefactos promocionales y enlaces de afiliado en un hub de modelos.
- Auditoría de repositorios: sirve como caso de prueba para filtros que detecten repositorios sin pesos ni pipeline declarado.
- Análisis de marketing de afiliación: permite examinar el uso de códigos promocionales ("PROPFIRMW") y enlaces de referido en plataformas técnicas.
- Formación sobre licencias: ilustra el uso de la licencia MIT en un artefacto que no es software ni modelo, lo que plantea dudas sobre su aplicabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el repositorio no contiene artefactos desplegables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoría técnica de "modelos" comparable, porque este repositorio no es un modelo de IA. Frente a modelos reales de scaling de capital o de simulación financiera, la comparación no procede: aquellos incluyen código ejecutable y datos, mientras que este artefacto solo contiene texto descriptivo y enlaces de afiliado.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, tokenizador, arquitectura y pipeline; no puede ejecutarse ni evaluarse técnicamente.
- Riesgo de confusión: el nombre y los tags pueden llevar a un desarrollador a pensar que es un modelo de "scaling" en el sentido de escalado de modelos, cuando se refiere a escalado de capital de trading.
- Contenido promocional: la model card incluye enlaces de afiliado y un código promocional ("PROPFIRMW") hacia FundedNext y PropFirm-Match.pro; no es contenido neutral ni verificable.
- Sin validación financiera: la simulación de crecimiento al 40% por ciclo hasta 4.000.000 de dólares no está respaldada por datos, código ni análisis de riesgo; no debe tomarse como asesoramiento financiero.
- Licencia MIT: aunque declarada, su aplicación a un artefacto que no es software es dudosa; conviene revisar los términos antes de cualquier reutilización.
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de mantenimiento o comunidad.
- Idiomas no declarados: no hay información sobre el idioma del contenido más allá del inglés de la model card.
- Para producción: no usar; no aporta ninguna funcionalidad de IA ni financiera ejecutable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ZODOGAVAJD/fundednext-equity-scaling-algorithm-propfirmw
- Sitio enlazado en la model card (afiliado): https://propfirm-match.pro/
- Sitio enlazado en la model card (afiliado con código): https://fundednext.com/?fpr=PROPFIRMW
