# yhavinga/gemma-4-31b-it-en-nl-grpo-lora

## Resumen

`yhavinga/gemma-4-31b-it-en-nl-grpo-lora` es un adaptador LoRA para el modelo `google/gemma-4-31B-it`, desarrollado por el usuario yhavinga y orientado a la traduccion del ingles al neerlandes. Su objetivo no es tanto mejorar la fidelidad de traduccion como reducir el llamado "translationese": producir un neerlandes mas natural e idiomatico, parecido al que escribiria un nativo, sin sacrificar la fidelidad respecto al original. Para ello se entrena con aprendizaje por refuerzo online mediante GRPO, partiendo del modelo base instruct de Google.

El modelo base es Gemma 4 31B en su variante instruct, un transformer denso de aproximadamente 31.000 millones de parametros con decodificador de texto de 60 capas, de las cuales 10 usan atencion global. El adaptador congela los embeddings y entrena modulos LoRA de rango 32 sobre las proyecciones de atencion y MLP de todas las capas, sumando 244,9 millones de parametros entrenables almacenados en float32.

Es relevante ahora porque demuestra una aplicacion concreta de RL con recompensas basadas en clasificadores y metricas de calidad de traduccion (MetricX-24-QE) sobre un modelo grande, y porque publica evaluaciones comparativas frente al modelo base en conjuntos held-out (WMT24++, FLORES-200, NTREX-128). La licencia apache-2.0 facilita su uso comercial, aunque el modelo base Gemma tiene sus propias condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Gemma 4 31B-it; decodificador de texto de 60 capas, 10 de atencion global |
| Parametros totales | 244,9 M en el adaptador (410 modulos LoRA); modelo base ~31B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Gemma 4 31B-it) |
| Tipos de cuantizacion | Adaptador en float32; versiones GGUF del adaptador fusionado en Q4_K_M y Q8_0 (repo separado) |
| Idiomas soportados | Ingles (en) y neerlandes (nl) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); GGUF disponible en repo independiente |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-4-31B-it`, un transformer denso con decodificador de texto de 60 capas, de las cuales 10 son de atencion global (en estas, los valores provienen de `k_proj`, por lo que no tienen `v_proj`). El LoRA tiene rango 32, alpha 16 (escala 0,5) y se aplica a las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y MLP (`gate_proj`, `up_proj`, `down_proj`) de todas las capas: 410 modulos y 244,9 M parametros en float32. Los embeddings permanecen congelados y el dropout es 0.

El entrenamiento usa GRPO online (variante Dr. GRPO, con ventaja de grupo sin division por desviacion estandar) partiendo del modelo base. En cada iteracion se muestrean 8 traducciones por fuente (temperatura 1.0) sobre 512 textos en ingles de 20 a 256 tokens, incluyendo retrotraducciones al ingles de textos neerlandeses e instrucciones FLAN. La recompensa es el logit recortado (±12) de un clasificador ModernBERT neerlandes (`yhavinga/dmbert-230m-fineweb2-optout`, afinado para distinguir neerlandes original de neerlandes traducido automaticamente), menos penalizaciones por regresiones de MetricX-24-QE respecto al ancla greedy del modelo base y por desviaciones de longitud fuera de [0,85, 1,15]. Los fallos duros (truncamiento, bucles, ingles residual, QE > 10) reciben −30. Se optimiza con AdamW, LR constante 5e-5, penalizacion KL (k2, beta = 0,04), unas 27 pasos de optimizador por iteracion. El entrenamiento se detuvo tras la iteracion 17 por regla de parada sobre QE de validacion; esta release es la iteracion 15 (410 pasos). Se entreno con MaxText y se convirtio a PEFT, verificando la conversion en `transformers` contra la salida greedy del modelo entrenado.

## Capacidades

- Traduccion ingles a neerlandes con enfasis en naturalidad idiomatica y reduccion de "translationese".
- Traduccion fiel: preserva nombres, numeros, detalles, matices y tono del original.
- Mantiene parrafos, saltos de linea y formato del texto de entrada.
- Generacion concisa, ajustada a la longitud del original.
- Funciona con decodificacion greedy (temperatura 0) y tambien con muestreo (por ejemplo, temperatura 1.0 para best-of-N y reranking).
- Compatible con la plantilla de chat del modelo base con el modo "thinking" desactivado (por defecto).
- No soporta tool calling, agentes ni vision de forma especifica en el adaptador; estas capacidades dependerian del modelo base y no se documentan aqui.

## Casos de uso

- Traduccion de documentacion tecnica: el adaptador mantiene terminos, numeros y formato, lo que lo hace adecuado para manuales y guias donde la consistencia es critica.
- Localizacion de contenido web y marketing: al producir neerlandes mas natural, encaja en la adaptacion de textos promocionales que deben sonar nativos.
- Traduccion de articulos y prensa: la preservacion de tono y matices permite usar el modelo en contenido editorial con revision humana posterior.
- Generacion de candidatos para best-of-N: con muestreo a temperatura 1.0 y un reranker externo, se pueden producir varias traducciones y seleccionar la mejor.
- Traduccion por lotes en pipelines: el adaptador fusionado en GGUF (Q4_K_M, Q8_0) permite desplegarlo en llama.cpp o LM Studio para procesar volumenes moderados.
- Evaluacion de sistemas de traduccion: sirve como referencia de traduccion EN-NL natural para comparar otros modelos o como componente en estudios de calidad.
- Traduccion de correspondencia y comunicaciones internas: para empresas que operan en ingles y neerlandes y necesitan textos claros y naturales sin coste de traduccion humana por cada documento.

## Benchmarks y rendimiento

Datos publicados en la model card sobre conjuntos held-out (no usados en entrenamiento ni en la seleccion del checkpoint). MetricX-24 QE (menor es mejor) y COMET-22 (mayor es mejor), frente al modelo base con el mismo prompt y decodificacion greedy:

| Conjunto | n | QE adaptador | QE base | QE referencia humana | COMET-22 adaptador | COMET-22 base |
|---|---:|---:|---:|---:|---:|---:|
| WMT24++ en-nl | 480 | 2,249 | 2,276 | 2,463 | 0,8512 | 0,8502 |
| FLORES-200 en-nl | 504 | 1,116 | 1,115 | 1,493 | 0,8889 | 0,8895 |
| NTREX-128 en-nl | 999 | 1,520 | 1,547 | 1,874 | 0,8813 | 0,8820 |

Resultados adicionales:

| Metrica | Adaptador | Base |
|---|---:|---:|
| Clasificador de neerlandes original (C1, WMT24++ 480 + FLAN 500) | 34,2% | 30,0% (+4,2 pp) |
| C1 en WMT24++ | 52,9% | 48,5% |
| C1 en FLAN | 16,2% | 12,2% |
| Evaluacion pairwise ciega (greedy, 100 pasajes, revisor ciego Claude) | 20 mejor / 57 igual / 23 peor | errores 15 vs 12 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 62 GB de memoria de acelerador o CPU, segun indica la model card.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para bf16; en consumer GPU no cabe en bf16.
- En consumer GPU, usar la version GGUF fusionada (Q4_K_M o Q8_0) del repo `yhavinga/gemma-4-31b-it-en-nl-grpo-GGUF`, que reduce los requisitos aunque el modelo base de 31B sigue siendo exigente.
- Opciones de despliegue: `transformers` + `peft` (con `merge_and_unload()` para acelerar), llama.cpp y LM Studio mediante los GGUF publicados. vLLM y TGI no se documentan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yhavinga/gemma-4-31b-it-en-nl-grpo-lora | 244,9 M adaptador sobre ~31B | no disponible | RL (GRPO) para naturalidad EN-NL | apache-2.0 | Hugging Face |
| yhavinga/gemma-4-31b-it-en-nl-lora | no disponible | no disponible | SFT con best-of-8 filtrado por juez | no disponible | Hugging Face |
| google/gemma-4-31B-it (base) | ~31B | no disponible | Modelo instruct general | condiciones Gemma | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, salvo las cifras del modelo base incluidas en la tabla de benchmarks.

## Limitaciones y advertencias

- Solo cubre la direccion ingles a neerlandes; no se documenta traduccion inversa ni otros pares de idiomas.
- El adaptador depende del modelo base Gemma 4 31B-it, sujeto a las condiciones de licencia de Google; la licencia apache-2.0 del adaptador no sustituye las del base.
- La evaluacion pairwise ciega no muestra una preferencia clara sobre el modelo base (20 mejor / 57 igual / 23 peor), por lo que la mejora es modesta y dependiente del conjunto.
- Riesgo de alucinacion y de omisiones o adiciones en textos largos, aunque el prompt exige no omitir ni anadir nada; se recomienda revision humana en contenido critico.
- El clasificador de recompensa puede introducir sesgos hacia ciertos estilos de neerlandes; no se documentan sesgos demograficos o de dominio.
- Requiere seguir estrictamente el prompt y la plantilla de chat del modelo base con thinking desactivado; desviarse puede degradar la calidad.
- En FLORES-200 el adaptador no mejora al base (QE 1,116 vs 1,115; COMET 0,8889 vs 0,8895), lo que indica que la ganancia no es uniforme entre dominios.
- El entrenamiento se detuvo en la iteracion 17 y esta release es la 15; no se documenta comportamiento fuera de los dominios evaluados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yhavinga/gemma-4-31b-it-en-nl-grpo-lora
- Version GGUF fusionada y cuantizada: https://huggingface.co/yhavinga/gemma-4-31b-it-en-nl-grpo-GGUF
- Adaptador companion entrenado con SFT: https://huggingface.co/yhavinga/gemma-4-31b-it-en-nl-lora
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Clasificador de neerlandes usado como recompensa: https://huggingface.co/yhavinga/dmbert-230m-fineweb2-optout
