# Tsuboyama-Lab/monoyield-predictor

## Resumen

monoyield-predictor es un conjunto de pesos entrenados (adaptadores LoRA y cabezas de regresión) que predicen el rendimiento de expresion monomerica en *Escherichia coli* de una secuencia proteica, expresado como log10 de mg/L. Lo desarrolla el laboratorio de Kotaro Tsuboyama (Tsuboyama-Lab) y es el material complementario del preprint *Massively parallel quantification and prediction of monomeric protein yield in Escherichia coli* (bioRxiv, 2026). El problema que resuelve es la prediccion cuantitativa del yield de expresion a partir solo de la secuencia, algo relevante para ingenieria de proteinas y diseno de anticuerpos de dominio unico.

El repositorio no contiene modelos completos: incluye unicamente las matrices LoRA y la cabeza de regresion (7-12 MB por fold), que se aplican sobre modelos de lenguaje de proteinas congelados. Se publican cuatro variantes: ESMC-MonoYield y SaProt LoRA para secuencias de aminoacidos generales, y ESMC-Nb-MonoYield y ESMC-Nb-MDRatio especializadas en nanobodies (prediccion de yield monomerico y de ratio monomerico/dimerico). Cada variante incluye cinco checkpoints de validacion cruzada y la prediccion final es la media de los cinco.

La relevancia actual radica en que combina modelos de lenguaje de proteinas de gran escala (ESMC-6B, de 6.000 millones de parametros, y SaProt de 1.300 millones) con datos de medicion masiva de yield, ofreciendo una herramienta de prediccion lista para usar sobre secuencias nuevas con un coste de entrenamiento muy reducido gracias a LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelos de lenguaje de proteinas transformer (ESMC-6B y SaProt 1.3B) mas cabeza de regresion MLP |
| Parametros totales | Adaptadores de 7-12 MB por fold; el modelo base ESMC-6B tiene 6.000 millones de parametros y SaProt 1.300 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la model card menciona ejecucion en float32 y bfloat16) |
| Idiomas soportados | No aplica: la entrada es secuencia de aminoacidos (y 3Di de Foldseek en SaProt) |
| Licencia | Apache-2.0 para los adaptadores; sujeto a las licencias de los modelos base (ESMC-6B: MIT con avisos de terceros y Biohub Acceptable Use Policy; SaProt: MIT) |
| Formato de pesos | Checkpoints PyTorch (`.pt`) cargados via PEFT |

## Arquitectura y entrenamiento

El modelo no es un transformer entrenado desde cero, sino un conjunto de adaptadores LoRA y cabezas de regresion acopladas a modelos de lenguaje de proteinas congelados. La variante principal, ESMC-MonoYield, usa `biohub/ESMC-6B` como base y recibe unicamente la secuencia de aminoacidos; la variante SaProt LoRA usa `westlake-repl/SaProt_1.3B_AFDB_OMG_NCBI` y recibe secuencia de aminoacidos mas la representacion 3Di de Foldseek. Las dos variantes para nanobodies (ESMC-Nb-MonoYield y ESMC-Nb-MDRatio) se apoyan tambien en ESMC-6B y predicen, respectivamente, el log10 del yield monomerico y el log10 del ratio monomerico/dimerico.

El entrenamiento se realizo sobre datos de medicion masiva de yield monomerico en *E. coli*, incluyendo datos de novo y de mutagénesis profunda (DMS), segun indica la model card. Se emplea validacion cruzada de cinco folds: cada carpeta contiene cinco checkpoints (`<model>_1.pt` a `<model>_5.pt`) y la prediccion final es la media de los cinco. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un modelo de regresion de este tipo).

## Capacidades

- Prediccion de yield de expresion monomerica en *E. coli* a partir de secuencia de aminoacidos (log10 mg/L).
- Prediccion especializada para nanobodies: yield monomerico y ratio monomerico/dimerico.
- Entrada multimodal en la variante SaProt: secuencia de aminoacidos mas estructura tokenizada con Foldseek 3Di.
- Regresion cuantitativa (no generacion de texto): salida escalar continua.
- Uso mediante scripts de Python del repositorio oficial, con soporte para CSV de entrada y salida.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingues; su dominio es exclusivamente proteinas.

## Casos de uso

- Filtrado temprano en diseno de nanobodies: dada una libreria de secuencias candidatas, predecir el yield monomerico y descartar variantes con baja expresabilidad antes de sintetizarlas y ensayarlas en laboratorio.
- Optimizacion de constructos para expresion en *E. coli*: evaluar mutaciones puntuales o variantes de una proteina de interes y priorizar aquellas con mayor yield predicho.
- Priorizacion en campanas de mutagénesis profunda (DMS): usar las predicciones como capa de priorizacion sobre los datos DMS para seleccionar las variantes a validar experimentalmente.
- Deteccion de propension a dimerizacion en nanobodies: la variante ESMC-Nb-MDRatio permite estimar el ratio monomerico/dimerico y descartar candidatos con tendencia a agregarse.
- Integracion en pipelines de proteinas: el modelo se puede invocar desde scripts Python sobre lotes de secuencias, lo que permite incorporarlo a flujos automatizados de diseno y seleccion.
- Investigacion en biologia sintetica: estudiar la relacion entre secuencia y expresabilidad en *E. coli* y validar hipotesis sobre determinantes del yield monomerico.
- Evaluacion comparativa de representaciones: al estar disponibles variantes basadas en ESMC-6B y SaProt, permite comparar el valor predictivo de distintas representaciones proteicas sobre el mismo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- ESMC-6B en float32 requiere una GPU con aproximadamente 48 GB de memoria (segun la model card).
- Con `--dtype bfloat16` cabe en 24 GB, aunque el autor indica que debe validarse.
- GPU recomendadas: A100 80 GB o H100 para la configuracion en float32; A100 40 GB, L40S o RTX 4090 (24 GB) para bfloat16.
- La variante SaProt LoRA, con base de 1.300 millones de parametros, es mucho mas ligera y cabe con holgura en GPUs de consumo.
- Despliegue: los pesos se cargan mediante PEFT y los scripts del repositorio oficial (`scripts/predict_esmc_mlp_head.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros base | Entrada | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| monoyield-predictor (ESMC-MonoYield) | 6.000 M (ESMC-6B) | Secuencia de aminoacidos | Yield monomerico en *E. coli* | Apache-2.0 (adaptadores) | Hugging Face + GitHub |
| monoyield-predictor (SaProt LoRA) | 1.300 M (SaProt) | Aminoacidos + 3Di | Yield monomerico en *E. coli* | Apache-2.0 (adaptadores) | Hugging Face + GitHub |
| ESMC-6B (modelo base) | 6.000 M | Secuencia de aminoacidos | Representaciones generales de proteinas | MIT + Biohub AUP | Hugging Face |
| SaProt 1.3B (modelo base) | 1.300 M | Aminoacidos + 3Di | Representaciones generales de proteinas | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo con otros predictores de yield en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo predice exclusivamente yield de expresion monomerica en *E. coli*; no es un modelo generativo ni un predictor general de propiedades proteicas.
- Las predicciones son regresiones sobre un objetivo concreto y pueden no generalizar a proteinas fuera de la distribucion de entrenamiento (por ejemplo, familias no representadas en los datos de novo o DMS).
- La variante de nanobodies esta entrenada especificamente para ese formato; su uso sobre otras arquitecturas de anticuerpo no esta validado.
- El rendimiento en bfloat16 no esta validado por el autor; se recomienda float32 o validacion previa.
- Los adaptadores son derivados de los modelos base y su uso queda sujeto a las licencias y politicas de estos, incluida la Biohub Acceptable Use Policy para ESMC-6B.
- No se documentan sesgos especificos ni tasas de alucinacion (no aplica en un modelo de regresion), pero la fiabilidad de las predicciones depende de la calidad y cobertura del dataset de entrenamiento.
- El repositorio tiene muy poca traccion (0 descargas, 1 like en el momento de la consulta), por lo que la comunidad de validacion es practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/Tsuboyama-Lab/monoyield-predictor
- Repositorio de codigo: https://github.com/tsubo-lab/monoyield-predictor
- Preprint (bioRxiv): https://doi.org/10.64898/2026.11.02.763507
- Datos y codigo archivados (Zenodo): https://doi.org/10.5281/zenodo.23874456
- Modelo base ESMC-6B: https://huggingface.co/biohub/ESMC-6B
- Modelo base SaProt: https://huggingface.co/westlake-repl/SaProt_1.3B_AFDB_OMG_NCBI
- Politica de uso aceptable de Biohub: https://biohub.org/acceptable-use-policy/
