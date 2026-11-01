# SymmetryAdvantage/WyFormer-LeMat-Ehull

## Resumen

WyFormer-LeMat-Ehull es un modelo generativo de estructuras cristalinas desarrollado por SymmetryAdvantage. No genera coordenadas atomicas directamente, sino representaciones de Wyckoff: dado un conjunto de "genes" (espacio grupo, composicion y posiciones de Wyckoff), el modelo produce estructuras cristalinas completas que despues se relajan a geometria 3D con un potencial interatomico de machine learning (MLIP). El modelo esta condicionado por la energia por encima del casco convexo (energy above hull, e_hull) mediante classifier-free guidance, lo que permite pedir explicitamente estructuras proximas al estado termodinamicamente estable.

La relevancia practica esta en el descubrimiento de materiales: en lugar de muestrear estructuras aleatorias y filtrarlas a posteriori, el modelo permite dirigir la generacion hacia la region de estabilidad termodinamica. Segun la model card, con `energy_above_hull=0.05` y escala de guidance 5 se obtiene un MetaSUN de 0,525 por gen muestreado (estructuras validas, unicas y novedosas con e_hull ≤ 0,1 eV/atomo), y el filtrado previo a la relajacion eleva ese rendimiento hasta 0,870 en el mejor de los protocolos evaluados.

Tecnicamente es un transformer encoder de 3 capas con condicionamiento AdaLN sobre `log1p(e_hull)`, entrenado sobre el dataset LeMat-Bulk-fixed con tokens de `der_tokenizer_v1`. Es un modelo de nicho, orientado a investigacion en ciencia de materiales, no a proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 3 capas con condicionamiento AdaLN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico; opera sobre representaciones de Wyckoff) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (libreria `wyckoff-transformer`; repo de 0.0 GB en HuggingFace) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 3 capas que opera sobre tokens de `der_tokenizer_v1`, una tokenizacion especifica de representaciones de Wyckoff. La condicion (energia por encima del casco convexo) se inyecta mediante AdaLN sobre la transformacion `log1p(e_hull)`. Durante el entrenamiento la condicion se descarta en el 10 % de los casos, lo que habilita el classifier-free guidance en inferencia: la escala de guidance interpola entre el modelo condicional puro (`--guidance-scale 1`) y una generacion mas fuertemente dirigida hacia el valor de e_hull solicitado.

Los datos de entrenamiento provienen de LeMat-Bulk-fixed en la revision `bf8f0b31`, con filtro de fuerza residual ≤ 1 eV/Å. La condicion asociada a cada estructura es su `energy_above_hull` calculada contra el casco convexo PBE del conjunto completo. La optimizacion uso AdamW con un schedule warmup-stable-decay; el mejor loss de validacion registrado fue 17,23 (run de W&B `ehull_adamw_wsd_5x_cfg_long-20261015-021519`). No se documenta el numero total de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion condicionada de representaciones de Wyckoff: dado un valor objetivo de `energy_above_hull`, el modelo elige espacio grupo, composicion y posiciones de Wyckoff.
- Generacion incondicional o condicional pura mediante `--guidance-scale 1`.
- Control del compromiso validez/calidad mediante la escala de guidance: aproximadamente 86 % de draws formalmente validos con w = 3 y 61 % con w = 5.
- Produccion de "genes" que pueden relajarse a estructuras 3D con un MLIP (CrySPR y ORB v3 en la evaluacion reportada).
- Generacion de estructuras novedosas respecto al conjunto de entrenamiento (novelty de genes de 0,699 en el protocolo evaluado).
- No soporta tool calling, agentes, razonamiento multi-step, vision ni audio: es un modelo generativo de dominio especifico para estructuras cristalinas.

## Casos de uso

- Descubrimiento de materiales metastables: solicitando `energy_above_hull=0.05` con guidance 5 se generan candidatos proximos a la estabilidad termodinamica, utiles para sintesis fuera del equilibrio (fases metastables) con mayor probabilidad de ser novedosas que pidiendo 0 eV/atomo.
- Generacion de candidatos para cribado DFT: los genes generados se relajan con un MLIP y los mejores se promueven a calculos DFT, reduciendo el coste frente a muestreo aleatorio de estructuras.
- Generacion condicionada por composicion o espacio grupo: el modelo infiere espacio grupo y posiciones de Wyckoff compatibles con la condicion energetica solicitada, lo que sirve para explorar familias estructurales concretas.
- Priorizacion con modelo auxiliar: combinando la generacion con WyFormer-LeMat-Energy para rankear candidatos, el MetaSUN por relajacion sube de 0,513 (primeros 1.000 draws) a 0,669 en el protocolo reportado.
- Filtrado por "sorpresa" del generador: seleccionar el 30 % de genes que el generador encuentra menos probables y despues rankearlos alcanza un MetaSUN de 0,870 con un presupuesto de 1.000 relajaciones, adecuado cuando el coste de relajacion es el cuello de botella.
- Generacion de datasets sinteticos de estructuras cristalinas para entrenar o aumentar modelos de potenciales interatomicos, con control sobre la distribucion energetica de las muestras.
- Exploracion de espacios quimicos amplios: al condicionar sobre e_hull en lugar de sobre una composicion fija, el modelo propone simultaneamente composicion y estructura, lo que permite barridos de descubrimiento sin enumerar candidatos manualmente.

## Benchmarks y rendimiento

Evaluacion con protocolo de ranking de novo: genes relajados con CrySPR y ORB v3 (`orb_conserv_inf`), novedad juzgada contra LeMat-Bulk-fixed, condicion `energy_above_hull=0.05`, guidance w = 5.

| Metrica por gen muestreado (1.000 genes) | Valor |
|---|---:|
| MetaSUN | 0,525 |
| Metastable | 0,723 |
| SUN (e_hull ≤ 0) | 0,005 |
| Novedad de genes | 0,699 |
| Estructuras validas y unicas | 0,939 |

Rendimiento del filtrado previo a la relajacion (pool de 10.000 genes totalmente relajados, presupuesto de 1.000 relajaciones):

| Seleccion | MetaSUN |
|---|---:|
| Los primeros 1.000 draws | 0,513 |
| Los primeros 1.000 genes no presentes en LeMat-Bulk-fixed | 0,615 |
| Esos, rankeados por WyFormer-LeMat-Energy | 0,669 |
| Esos, el 30 % menos sorprendente para el generador, luego rankeados | 0,870 |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo de HuggingFace ocupa 0,0 GB y no se publican recuentos de parametros, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano aparentemente reducido (encoder de 3 capas) es plausible que quepa en GPU de consumo, pero no se confirma en la documentacion.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: la via documentada es la CLI del paquete `wyckoff-transformer` (`pip install wyckoff-transformer`, comando `wyformer-generate`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card solo aporta el coste en numero de muestras (`--initial-n-samples` aproximadamente el doble de `--firm-n-samples` con w = 5) y el coste posterior de relajacion con MLIP.

## Comparativa con modelos similares

No se dispone de datos de otros modelos generativos de estructuras cristalinas con condicionamiento energetico en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia interna del propio ecosistema, el autor publica WyFormer-LeMat-Energy, un modelo complementario usado para rankear candidatos generados por este modelo (no es una alternativa generativa, sino un componente del pipeline de seleccion).

| Modelo | Funcion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WyFormer-LeMat-Ehull | Generacion condicionada por e_hull | no disponible | no disponible | Apache 2.0 | HuggingFace + CLI `wyckoff-transformer` |
| WyFormer-LeMat-Energy | Ranking/prediccion energetica de candidatos | no disponible | no disponible | no disponible | HuggingFace |
| Alternativas generativas de estructuras cristalinas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor advierte que pedir `energy_above_hull=0` hace que el modelo reproduzca estructuras ya vistas, reduciendo la novedad de los genes generados; el ajuste recomendado es 0,05 eV/atomo.
- Existe un compromiso explicito entre validez formal y calidad: solo aproximadamente el 61 % de los draws son formalmente validos con w = 5, frente al 86 % con w = 3. Un guidance alto mejora la condicion energetica a costa de validez.
- La tasa de estructuras estables (SUN, e_hull ≤ 0) es muy baja: 0,005 por gen muestreado. El modelo esta orientado a materiales metastables, no a estabilidad absoluta.
- Los resultados dependen del pipeline de relajacion (CrySPR + ORB v3) y del protocolo de evaluacion; no se garantiza que se trasladen a otros MLIP o a validacion DFT directa.
- No hay informacion sobre sesgos de composicion del dataset LeMat-Bulk-fixed ni sobre cobertura de espacios quimicos; el modelo hereda los sesgos de dicho corpus.
- No se documentan parametros, contexto, cuantizaciones ni requisitos de hardware, lo que dificulta planificar despliegues en produccion.
- Es un modelo de dominio muy especifico: no procesa lenguaje natural ni codigo, y su salida requiere herramientas externas para convertirse en estructuras 3D utilizables.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del dataset de entrenamiento (LeMat-Bulk-fixed) antes de explotar comercialmente los pesos o los datos derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SymmetryAdvantage/WyFormer-LeMat-Ehull
- Modelo auxiliar de ranking: https://huggingface.co/SymmetryAdvantage/WyFormer-LeMat-Energy
- Repositorio del proyecto (instrucciones de inferencia y relajacion con MLIP): https://github.com/SymmetryAdvantage/WyckoffTransformer
- Seccion de inferencia del README: https://github.com/SymmetryAdvantage/WyckoffTransformer#inference
- Dataset de entrenamiento: https://huggingface.co/datasets/kazeevn/LeMat-Bulk-fixed
