# SZLHOLDINGS/governed-norm-v2-trained

## Resumen

`SZLHOLDINGS/governed-norm-v2-trained` es un modelo publicado en Hugging Face por el usuario SZLHOLDINGS bajo el ecosistema de `transformers`. La model card es la plantilla automática generada por el Hub y no contiene información sustantiva: no se especifican autoría real, tipo de modelo, idiomas, licencia, datos de entrenamiento ni resultados de evaluación. El repositorio figura con un tamaño de 0.0 GB y cero descargas en el momento de la consulta, lo que impide verificar que los pesos estén efectivamente subidos.

El nombre sugiere un modelo relacionado con normalización "governed" en su versión 2, pero se trata de una inferencia a partir del identificador, no de un dato confirmado por el autor. No hay paper, blog, demo ni repositorio de código asociado en la información disponible. El único enlace técnico presente es la referencia genérica a Lacoste et al. (2019) sobre estimación de emisiones de carbono, que aparece en la plantilla estándar de model cards y no guarda relación con el modelo.

Por tanto, esta ficha documenta lo que se puede verificar y marca explícitamente como "no disponible" todo lo demás. Cualquier evaluación de idoneidad para producción, comparación de rendimiento o estimación de requisitos de hardware debe considerarse bloqueada hasta que el autor publique especificaciones reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags del repo); no se confirma la presencia efectiva de ficheros |
| Librería declarada | transformers |
| Tamaño del repositorio | 0.0 GB |
| Pipeline declarado | no disponible |
| Fecha de creación | 2026-11-14 |
| Fecha de actualización | 2026-11-14 |

## Arquitectura y entrenamiento

No disponible. La model card no describe la arquitectura (transformer, MoE, SSM, híbrido u otra), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

El tag `arxiv:1910.09700` que aparece en los metadatos del Hub corresponde a Lacoste et al. (2019) sobre estimación de emisiones de carbono, citado en la plantilla estándar de model cards; no es un paper del modelo. El tag `endpoints_compatible` indica únicamente compatibilidad con los endpoints de inferencia del Hub, no una arquitectura concreta.

## Capacidades

- No se documenta ninguna capacidad específica en la información disponible.
- No se confirma soporte de generación de texto, razonamiento, código, matemáticas o visión.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirman capacidades multilingües.
- No se confirman modos especiales (thinking mode, visión, audio).

La etiqueta `endpoints_compatible` sugiere que el modelo podría desplegarse mediante los Inference Endpoints de Hugging Face si los pesos estuvieran presentes, pero no aporta información sobre qué tareas puede resolver.

## Casos de uso

No es posible recomendar casos de uso concretos con base en la información disponible. Los siguientes escenarios son genéricos para modelos `transformers` y quedan condicionados a que el autor publique especificaciones verificables:

- Clasificación o normalización de texto: si el modelo implementa realmente una capa de normalización entrenada, podría emplearse en pipelines de preprocesado, pero no hay evidencia de ello.
- Generación de texto en producción: requiere confirmar tamaño, contexto y licencia antes de integrarlo en cualquier servicio.
- Fine-tuning sobre dominio específico: solo viable si se publican los pesos y la licencia permite uso comercial.
- Evaluación comparativa interna: podría servir como baseline experimental, siempre que existan pesos descargables.
- Despliegue en endpoints gestionados: la etiqueta `endpoints_compatible` lo permitiría técnicamente, pero sin especificaciones no se puede dimensionar el coste.
- Investigación sobre normalización: únicamente si el autor documenta la metodología y los datos.

Ninguno de estos casos puede validarse con la información actual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del número de parámetros, que no se ha publicado).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería declarada es `transformers`, por lo que en principio sería compatible con vLLM, TGI o llama.cpp si los pesos existieran y estuvieran en un formato adecuado; no se confirma ninguno de estos extremos.
- Latencia y throughput estimados: no disponible.

El tamaño del repositorio (0.0 GB) sugiere que no hay ficheros de pesos alojados, lo que impediría cualquier despliegue en la práctica.

## Comparativa con modelos similares

No disponible. No se puede identificar una categoría funcional (tamaño, tarea, arquitectura) sin especificaciones publicadas, por lo que no procede comparar con alternativas concretas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SZLHOLDINGS/governed-norm-v2-trained | no disponible | no disponible | no disponible | repositorio de 0.0 GB, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card es la plantilla automática del Hub: no aporta información sobre sesgos, riesgos o limitaciones.
- Riesgo elevado de alucinación en cualquier uso práctico, derivado de la ausencia total de documentación y de la imposibilidad de verificar el comportamiento del modelo.
- El repositorio figura con 0.0 GB y cero descargas, lo que sugiere que los pesos podrían no estar publicados o no ser accesibles.
- Licencia no declarada: no se puede asumir permiso para uso comercial, modificación o redistribución.
- Idiomas no declarados: no se puede garantizar soporte de castellano ni de ningún otro idioma.
- Contexto y tamaño desconocidos: imposible dimensionar costes de inferencia o planificar despliegues.
- El identificador "governed-norm-v2-trained" sugiere un propósito de normalización, pero es una inferencia no confirmada por el autor.
- No se recomienda su uso en producción, investigación reproducible ni evaluación comparativa hasta que el autor publique especificaciones verificables y pesos accesibles.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/governed-norm-v2-trained
- Paper citado en la plantilla (no relacionado con el modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de carbono mencionada en la plantilla: https://mlco2.github.io/impact
- Repositorio, paper, blog y demo del modelo: no disponible.
