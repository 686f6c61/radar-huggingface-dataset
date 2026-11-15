# static0l0/Capri-1.0-4B

## Resumen

Capri-1.0-4B es un modelo de lenguaje publicado en Hugging Face por el usuario static0l0 bajo licencia Apache 2.0. El nombre indica un tamano de aproximadamente 4.000 millones de parametros, aunque la model card no aporta confirmacion tecnica de esa cifra ni detalles sobre la arquitectura subyacente. El repositorio no incluye pipeline declarado, idiomas soportados ni documentacion sobre el proceso de entrenamiento.

La informacion disponible es minima: la model card se limita a la declaracion de licencia y el repositorio no registra descargas ni interacciones en el momento de la consulta. Esto impide verificar las capacidades reales del modelo, su calidad o su idoneidad para tareas concretas. Cualquier evaluacion seria requeriria inspeccionar los pesos y ejecutar pruebas propias.

Por tanto, esta ficha recoge los pocos datos verificables y marca explicitamente como "no disponible" todo aquello que el autor no ha publicado. Se recomienda precaucion antes de integrar el modelo en cualquier flujo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | aproximadamente 4B (inferido del nombre, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. El nombre sugiere un transformer decoder-only de aproximadamente 4.000 millones de parametros, pero la model card no lo confirma ni detalla si emplea atencion completa, atencion lineal, mezcla de expertos u otra variante.

Tampoco hay datos sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF, DPO o ajuste supervisado. No se documentan innovaciones tecnicas ni optimizaciones de inferencia.

## Capacidades

- Generacion de texto: no confirmada por el autor; se asume por el tipo de modelo, pero no hay evidencia publicada.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Evaluacion interna de modelos: el modelo puede servir como candidato a probar en un banco de pruebas propio antes de considerar su adopcion, dado que no hay documentacion publicada sobre su comportamiento.
- Experimentacion academica: util para investigadores que quieran analizar las caracteristicas de un checkpoint de ~4B sin documentacion asociada y comparar su comportamiento con modelos equivalentes documentados.
- Prototipado de bajo riesgo: al estar bajo licencia Apache 2.0, puede integrarse en entornos de prueba no criticos donde un fallo no tenga consecuencias en produccion.
- Fine-tuning exploratorio: si los pesos son compatibles con las herramientas habituales (por confirmar), podria servir como base para ajuste fino en dominios especificos, aunque la falta de datos sobre el preentrenamiento aumenta el riesgo de resultados pobres.
- Pruebas de infraestructura de despliegue: util para validar pipelines de serving (vLLM, TGI, llama.cpp) con un modelo de ~4B antes de pasar a modelos mas grandes y costosos.
- Analisis de licencias y cadena de custodia: caso de estudio sobre publicaciones en Hugging Face sin model card sustantiva, relevante para equipos que evaluan la trazabilidad de modelos de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada por el autor. Como referencia orientativa para un modelo denso de ~4B en FP16, se requieren aproximadamente 8-9 GB de VRAM; en cuantizacion de 8 bits, alrededor de 4-5 GB; en 4 bits, alrededor de 2,5-3 GB. Estas cifras son estimaciones genericas y no estan verificadas para este checkpoint.
- GPU recomendadas: no disponible. Para un modelo de este tamano, opciones habituales serian RTX 3090, RTX 4090, A10G, L4 o A100, pero no hay confirmacion de compatibilidad.
- Cabe en GPU de consumo: probablemente si, en tarjetas con 8 GB o mas de VRAM, sujeto a verificacion.
- Opciones de despliegue: no disponible. Habria que comprobar la compatibilidad con vLLM, llama.cpp, Ollama o TGI una vez inspeccionados los formatos de pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Documentacion | Disponibilidad |
|---|---|---|---|---|---|
| Capri-1.0-4B | ~4B (inferido) | no disponible | Apache 2.0 | Minima (solo licencia) | Hugging Face |
| Qwen2.5-3B | 3,09B | 32.768 tokens | Apache 2.0 | Completa | Hugging Face |
| Llama 3.2-3B | 3,21B | 131.072 tokens | Llama 3.2 Community License | Completa | Hugging Face |
| Phi-3.5-mini | 3,8B | 131.072 tokens | MIT | Completa | Hugging Face |

La comparativa se ofrece como referencia de categoria (modelos densos de 3-4B); no implica que Capri-1.0-4B alcance un rendimiento similar, ya que no hay datos publicados para verificarlo.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay informacion sobre datos de entrenamiento, arquitectura ni evaluacion, lo que impide auditar sesgos o riesgos.
- Riesgo elevado de alucinacion y comportamiento impredecible: sin datos de alineacion ni benchmarks, no puede garantizarse ninguna calidad minima.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos de genero, etnicos, linguisticos o geopoliticos.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano u otras lenguas.
- Contexto desconocido: no se puede planificar su uso en tareas que requieran ventanas largas.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario asume toda la responsabilidad legal y tecnica sobre el comportamiento del modelo.
- Sin senales de comunidad: cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de validacion externa.
- No recomendado para produccion sin una evaluacion exhaustiva previa por parte del equipo integrador.

## Enlaces

- Hugging Face: https://huggingface.co/static0l0/Capri-1.0-4B
