# strata-engine/Inkling-2-Mini-DFlash2

## Resumen

Inkling-2-Mini-DFlash2 para Strata es un modelo borrador (draft model) de decodificación especulativa, es decir, un "drafter" que propone tokens candidatos para acelerar la generación del modelo principal Inkling-2-Mini. Lo publica el autor strata-engine como cuantización del drafter original de Inco AI y z-lab (incoai/Inkling-2-Mini-DFlash2), adaptada específicamente al motor de inferencia Strata. No es un modelo de lenguaje autónomo: solo el motor Strata lee este fichero, y su función es reducir la latencia de decodificación del modelo objetivo Inkling-2-Mini.

El artefacto sustituye el `model.safetensors` original (989.975.616 bytes en 16 bits) por un fichero `Inkling-2-Mini-DFlash2-mix.safetensors` de 551.600.700 bytes en formato propietario `strata-dflash2-q1`, variante `mix`. La cuantización aplica 8 bits por fila a las matrices de atención y 4 bits SF4 a las de feed-forward de las cinco capas, mientras que las proyecciones fc, K/V y de convolución, el selector con sus dos codebooks y las normas conservan sus valores originales.

La relevancia es práctica: reduce el peso del drafter de 331 MiB a 748 MiB frente al BF16 original, acorta la descarga de 990 MB a 552 MB y mantiene la tasa de aceptación de tokens dentro de unos 2 puntos del original, con ganancias de throughput medidas en GPUs de consumo y de datacenter bajo el motor Strata 0.2.23.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo borrador de decodificación especulativa DFlash 2 (5 capas con atención, feed-forward, proyecciones K/V y convolución, y selector con dos codebooks) |
| Parametros totales | no disponible (pesos originales 989.975.616 bytes en 16 bits; este fichero 551.600.700 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | atención 8 bits (una escala por fila), feed-forward 4 bits SF4; fc, K/V, convolución, selector, codebooks y normas sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, formato `strata-dflash2-q1`, variante `mix` |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa basado en DFlash 2, diseñado para proponer varios tokens por paso que el modelo objetivo Inkling-2-Mini verifica en paralelo. Consta de cinco capas en las que se distinguen matrices de atención (q/o), matrices de feed-forward (gate/up/down), proyecciones fc, K/V y de convolución, y un selector con dos codebooks. La cuantización de strata-engine solo toca las matrices grandes: atención a 8 bits con una escala por fila y feed-forward a 4 bits en formato SF4, dejando intactas las proyecciones K/V, la convolución, el selector y las normas.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO; el modelo deriva del drafter original de Inco AI y z-lab, y esta publicación es una copia modificada bajo la misma licencia Apache 2.0, generada el 2026-11-26. El soporte de DFlash 2 en Strata que ejecuta este drafter se basa en el port de DFlash 2 de tjm8874. El script `make_mix_from_original.py` (solo numpy) reconstruye el fichero a partir del original byte a byte, lo que permite verificar la reproducibilidad de la cuantización.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Inkling-2-Mini, verificados por el modelo objetivo.
- Aceleración de la decodificación en modo rápido del motor Strata, con ganancias de throughput variables según hardware y concurrencia.
- Modo exacto con salida idéntica a la del drafter original (verificado sobre 6 prompts en RTX 5090 y RTX 5060 Ti).
- Integración exclusiva con el motor Strata: no está pensado para otros runners ni para uso como modelo de lenguaje independiente.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües propias; esas funciones corresponden al modelo objetivo.
- Carga rápida: 0,25 s de tiempo de carga del drafter y 331 MiB de pesos en memoria.

## Casos de uso

- Aceleración de inferencia en producción con Strata: colocar el fichero como `dflash2.safetensors` en la carpeta del modelo permite al motor usar el drafter y aumentar los tokens por segundo en despliegues multiusuario (medido +22 % con 8 usuarios en RTX 5090).
- Servicio de generación de código de baja latencia: en RTX 5060 Ti con un usuario, la decodificación en modo código alcanza 241,5 tokens/s frente a 83,9 sin drafter, lo que lo hace adecuado para asistentes de autocompletado o generación de parches.
- Generación de JSON estructurado: con un usuario en RTX 5060 Ti se miden 159,3 tokens/s frente a 83,8 sin drafter, útil en pipelines que producen salidas estructuradas de forma masiva.
- Despliegue en GPUs de consumo con VRAM limitada: el drafter reduce el peso descargado de 990 MB a 552 MB y los pesos en memoria de 748 MiB a 331 MiB, lo que libera VRAM para el modelo principal en tarjetas de 16 GB.
- Escalado multiusuario en servidores: en RTX 5060 Ti las ganancias crecen con la concurrencia (+11 % con 16 usuarios, +29 % con 32, +47 % con 64), adecuado para endpoints con muchas peticiones concurrentes.
- Verificación de integridad en CI/CD: el SHA-256 publicado (`cf7dbb08…`) y el script de reconstrucción permiten validar el artefacto en pipelines de despliegue antes de servirlo.
- Reproducción de resultados: el script `make_mix_from_original.py` permite regenerar el fichero desde el original y auditar la cuantización en entornos de investigación.

## Benchmarks y rendimiento

Mediciones publicadas por el autor con el motor Strata 0.2.23, modelo objetivo Inkling-2-Mini-SQ-20, decodificación greedy y comparación frente a ejecución sin drafter:

| Escenario | Métrica | Con drafter | Sin drafter | Variación |
|---|---|---|---|---|
| RTX 5090 (32 GB), 4 usuarios, modo rápido | tokens/s extremo a extremo | no disponible | no disponible | +10,5 % |
| RTX 5090 (32 GB), 8 usuarios, modo rápido | tokens/s extremo a extremo | no disponible | no disponible | +22 % |
| RTX 5090 (32 GB), 16 usuarios, modo rápido | tokens/s extremo a extremo | no disponible | no disponible | +20 % |
| RTX 5090 (32 GB), 32 usuarios, modo rápido | tokens/s extremo a extremo | no disponible | no disponible | +8,6 % |
| RTX 5090 (32 GB), 64 usuarios, modo rápido | tokens/s extremo a extremo | no disponible | no disponible | -1 % (sin drafter) |
| RTX 5060 Ti (16 GB), 1 usuario, prosa | tokens/s decodificación | 82,9 | 83,8 | -1,1 % |
| RTX 5060 Ti (16 GB), 1 usuario, JSON | tokens/s decodificación | 159,3 | 83,8 | +90,1 % |
| RTX 5060 Ti (16 GB), 1 usuario, código | tokens/s decodificación | 241,5 | 83,9 | +187,8 % |
| RTX 5060 Ti (16 GB), 16 usuarios | tokens/s | no disponible | no disponible | +11 % |
| RTX 5060 Ti (16 GB), 32 usuarios | tokens/s | no disponible | no disponible | +29 % |
| RTX 5060 Ti (16 GB), 64 usuarios | tokens/s | no disponible | no disponible | +47 % |

Tasa de aceptación de tokens: dentro de unos 2 puntos de la del fichero original en RTX 5090 y RTX 5060 Ti. Salida en modo exacto idéntica a la del original en ambas tarjetas sobre 6 prompts. Tiempo de carga del drafter: 0,25 s. Pesos en memoria: 331 MiB (original en BF16: 748 MiB). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible, ya que el artefacto no es un modelo de lenguaje evaluable de forma autónoma.

## Requisitos de hardware

- VRAM estimada: 331 MiB de pesos del drafter, adicionales a la memoria que requiera el modelo objetivo Inkling-2-Mini-SQ-20.
- GPUs verificadas por el autor: RTX 5090 (32 GB) y RTX 5060 Ti (16 GB).
- Cabe en GPU de consumo: sí, con 331 MiB de pesos el drafter no es el factor limitante; el límite lo marca el modelo principal.
- Opciones de despliegue: exclusivamente el motor Strata (versión de referencia 0.2.23); no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: carga en 0,25 s; en RTX 5060 Ti con un usuario, 82,9 tokens/s en prosa, 159,3 en JSON y 241,5 en código; en RTX 5090 las ganancias multiusuario llegan al +22 % con 8 usuarios y desaparecen por encima de 32 usuarios, donde el motor decodifica sin drafter.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano de pesos | Cuantizacion | Licencia | Motor compatible | Throughput |
|---|---|---|---|---|---|---|
| strata-engine/Inkling-2-Mini-DFlash2 (este) | drafter DFlash 2 | 551.600.700 bytes (331 MiB) | atención 8 bits, FFN 4 bits SF4 | Apache 2.0 | Strata | +22 % con 8 usuarios en RTX 5090; hasta 241,5 tokens/s en código en RTX 5060 Ti |
| incoai/Inkling-2-Mini-DFlash2 (original) | drafter DFlash 2 | 989.975.616 bytes (748 MiB BF16) | 16 bits | Apache 2.0 | Strata (y otros según el port de DFlash 2) | referencia base; aceptación ~2 puntos superior |
| Ejecución sin drafter sobre Inkling-2-Mini-SQ-20 | decodificación estándar | no aplica | no aplica | Apache 2.0 (modelo objetivo) | Strata | 83,8-83,9 tokens/s en RTX 5060 Ti con 1 usuario |

No se dispone de información sobre otros drafters alternativos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera respuestas por sí mismo ni debe evaluarse con benchmarks de calidad; su única función es proponer tokens para Inkling-2-Mini.
- Dependencia exclusiva del motor Strata; fuera de ese motor el fichero no es utilizable. Sin el drafter, Inkling-2-Mini funciona igualmente sin aceleración.
- Las ganancias de rendimiento dependen del hardware y la concurrencia: en RTX 5090 con 64 usuarios el rendimiento cae un 1 % y el motor pasa a decodificar sin drafter; en prosa con un solo usuario en RTX 5060 Ti hay una ligera pérdida (82,9 frente a 83,8 tokens/s).
- La tasa de aceptación puede diferir hasta unos 2 puntos respecto al original, lo que afecta a la aceleración efectiva según la carga.
- La cuantización modifica el artefacto: es una copia modificada del original, no los pesos oficiales de Inco AI y z-lab, aunque se distribuye bajo la misma licencia Apache 2.0.
- Riesgo de alucinación y sesgos: no aplica de forma directa al drafter, pero los tokens propuestos se verifican contra el modelo objetivo, de modo que la calidad final depende de Inkling-2-Mini.
- Idiomas soportados: no disponible; la cobertura lingüística la determina el modelo objetivo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben conservarse `LICENSE` y `NOTICE` y atribuirse los pesos a Inco AI y z-lab, y el soporte DFlash 2 en Strata al port de tjm8874.
- El SHA-256 debe verificarse antes de desplegar; el autor publica el valor `cf7dbb08560dfd99544af0cdbab2915406fc571f516b19aff0fe113b9458d387` para el fichero cuantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/strata-engine/Inkling-2-Mini-DFlash2
- Modelo base: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Repositorio del motor Strata: https://github.com/Niko1221/Strata
- Releases de Strata: https://github.com/Niko1221/Strata/releases
