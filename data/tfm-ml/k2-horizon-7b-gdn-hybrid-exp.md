# TFM-ML/K2-Horizon-7B-GDN-Hybrid-Exp

## Resumen

K2-Horizon-7B-GDN-Hybrid-Exp es un prototipo de investigacion publicado por TFM-ML que modifica la arquitectura del modelo base IFM/K2-Horizon-7B sustituyendo la mitad de sus capas de atencion completa por capas Gated DeltaNet (GDN). El objetivo declarado por el autor es reducir el tamano de la cache KV durante la inferencia, manteniendo la mayor parte de los pesos originales intactos. Se trata de un experimento de arquitectura, no de un modelo afinado para produccion.

El modelo conserva las 36 capas del original, pero las 18 capas con indice par (base 0) pasan a ser GDN y las 18 con indice impar mantienen la atencion completa. Las capas GDN se inicializaron a partir de los pesos de atencion originales mediante un metodo adaptado del paper Taylor-Calibrate y despues se destilaron del modelo base, primero capa a capa y luego de extremo a extremo. Solo se entrenaron los parametros GDN; el resto de pesos no se ha modificado.

El resultado es una reduccion de la cache KV de 147.456 a 73.728 bytes por token, a cambio de un estado GDN de tamano fijo de aproximadamente 19 MiB en bf16 por secuencia. El propio autor etiqueta el modelo como experimental y advierte de una caida de calidad en tareas de razonamiento. El repositorio cuenta con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion completa y capas Gated DeltaNet (GDN), 36 capas (18 GDN en indices pares, 18 de atencion completa en indices impares) |
| Parametros totales | 9.457.474.944 (~9,46 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |

Nota: el nombre comercial indica "7B", pero el recuento real de parametros del checkpoint es de ~9,46 mil millones. La discrepancia probablemente proviene del nombre del modelo base.

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido que intercala dos tipos de capa. Las capas GDN emplean 16 cabezas de clave y 32 cabezas de valor con dimension de cabeza 128, ademas de una convolucion corta con tamano de kernel 4. Las capas de atencion completa conservan la configuracion original del modelo base. La consecuencia practica es una cache KV de 73.728 bytes por token frente a los 147.456 del modelo original, es decir, la mitad. Sin embargo, cada secuencia anade un estado GDN de tamano fijo de unos 19 MiB en bf16, independiente de la longitud del contexto.

El proceso de entrenamiento descrito en la model card consistente en inicializar las capas GDN a partir de los pesos de atencion originales usando un metodo adaptado del paper Taylor-Calibrate (arXiv:2606.16429), seguido de una destilacion en dos fases: primero capa a capa y despues de extremo a extremo. Solo se actualizaron los parametros de las capas GDN; el resto de pesos permanece identico al modelo base IFM/K2-Horizon-7B. No se menciona el uso de RLHF, DPO ni datos de entrenamiento adicionales, ni el numero de tokens empleado en la destilacion.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base IFM/K2-Horizon-7B.
- Razonamiento: el autor advierte explicitamente de una caida de calidad en tareas de razonamiento respecto al modelo base.
- Codigo y matematicas: no se documentan capacidades especificas; dependen del modelo base y pueden verse afectadas por la destilacion parcial.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el campo de idiomas no esta especificado.
- Capacidades especiales (vision, audio, thinking mode): ninguna documentada.

## Casos de uso

- Investigacion sobre atencion hibrida: el modelo sirve como banco de pruebas para medir el impacto de sustituir capas de atencion completa por GDN sobre la calidad y el consumo de memoria, comparando directamente contra el modelo base.
- Reduccion de memoria en inferencia de contexto largo: en escenarios donde la cache KV domina el consumo de VRAM, la mitad de bytes por token permite duplicar aproximadamente la longitud de contexto con la misma memoria, aunque hay que descontar los 19 MiB fijos de estado GDN por secuencia.
- Estudio de tecnicas de destilacion de arquitecturas hibridas: el pipeline descrito (inicializacion por Taylor-Calibrate, destilacion capa a capa y end-to-end) es replicable y util como referencia metodologica.
- Prototipado academico en entornos controlados: con licencia Apache-2.0, puede usarse en trabajos de investigacion que requieran modificar o inspeccionar la implementacion de las capas GDN.
- Analisis comparativo de cabezas de atencion: la configuracion asimetrica (16 cabezas de clave y 32 de valor en GDN) permite estudiar el reparto de capacidad entre claves y valores.
- Docencia sobre arquitecturas hibridas SSM/atencion: al ser un modelo pequeno (~9,46 B) y con codigo custom accesible, es adecuado para ilustrar el funcionamiento interno de Gated DeltaNet combinado con atencion clasica.

No se recomienda su uso en produccion ni en aplicaciones orientadas a usuario final, dado su caracter experimental y la ausencia de evaluacion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia de rendimiento es la advertencia cualitativa del autor de que la calidad cae en tareas de razonamiento.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 18,9 GB (coincide con el tamano del repositorio, 18,9 GB).
- VRAM estimada en bf16: en torno a 20-22 GB solo para pesos, mas cache KV y estado GDN; se recomienda un minimo de 24 GB.
- VRAM estimada en int8: del orden de 10-11 GB para pesos (no se publican checkpoints cuantizados; seria necesario generarlos).
- VRAM estimada en int4: del orden de 5-6 GB para pesos (no disponible oficialmente).
- Cache KV: 73.728 bytes por token (72 KiB). Para 8.192 tokens, aproximadamente 576 MiB; para 32.768 tokens, aproximadamente 2,25 GiB.
- Estado GDN: aproximadamente 19 MiB por secuencia en bf16, fijo e independiente de la longitud del contexto.
- GPU recomendadas: A100 40 GB o H100 para bf16 con margen; RTX 4090 o RTX 3090 (24 GB) para bf16 al limite con contextos cortos.
- GPU de consumo: cabe en tarjetas de 24 GB en bf16 con contexto reducido; en cuantizacion de 8 o 4 bits cabria en tarjetas de 12-16 GB, previa conversion manual.
- Despliegue: transformers con `trust_remote_code=True` y `transformers==5.17.0` es el unico entorno probado. La arquitectura custom `k2_horizon` no esta soportada de serie por vLLM, TGI, llama.cpp u Ollama; su uso en esos motores requeriria portar la implementacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Cache KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TFM-ML/K2-Horizon-7B-GDN-Hybrid-Exp | ~9,46 B | Hibrida (GDN + atencion completa) | 73.728 bytes | Apache-2.0 | Prototipo experimental |
| IFM/K2-Horizon-7B (modelo base) | no disponible en la informacion | Atencion completa | 147.456 bytes | no disponible en la informacion | Modelo base publicado |
| Otras alternativas de ~7-10 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de terceros en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Caracter experimental declarado por el autor: no es apto para produccion sin una evaluacion previa exhaustiva.
- Caida de calidad en tareas de razonamiento respecto al modelo base, segun la propia model card.
- Solo se entrenaron los parametros GDN; el modelo hereda los sesgos y limitaciones del modelo base IFM/K2-Horizon-7B, que no estan documentados en la informacion disponible.
- Riesgo de alucinacion no evaluado ni cuantificado; al no publicarse benchmarks, no hay estimacion fiable.
- Idiomas soportados sin especificar, lo que impide garantizar un comportamiento correcto fuera del idioma o idiomas del modelo base.
- Longitud de contexto no declarada, lo que dificulta planificar despliegues con secuencias largas.
- Requiere `trust_remote_code=True` y una version concreta de transformers (5.17.0); el codigo custom se ejecuta en el entorno del usuario y debe revisarse antes de usarlo.
- Sin soporte conocido en motores de inferencia estandar (vLLM, llama.cpp, TGI, Ollama); integrarlo implica trabajo adicional de portado.
- No hay checkpoints cuantizados publicados, por lo que el despliegue en GPU de gama media exige generar las cuantizaciones manualmente.
- La licencia Apache-2.0 permite uso comercial del artefacto, pero la condicion de prototipo experimental y la ausencia de evaluacion desaconsejan ese uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TFM-ML/K2-Horizon-7B-GDN-Hybrid-Exp
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Paper Taylor-Calibrate: https://arxiv.org/abs/2606.16429
