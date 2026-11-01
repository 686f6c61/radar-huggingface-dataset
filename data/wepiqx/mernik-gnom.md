# wepiqx/MERNIK-gnom

## Resumen

MERNIK-gnom es el ranker aprendido del asignador de cuantización del proyecto MERNIK, publicado por el usuario wepiqx en HuggingFace. No es un modelo de lenguaje: es un conjunto de 75 MLPs pequeños que predicen, para cada grupo de tensores de un modelo de lenguaje, cuánto daño (divergencia KL respecto a la referencia en BF16) causaría bajar ese grupo un nivel de cuantización. El cuantizador usa esas predicciones para repartir su presupuesto de bytes protegiendo los grupos con mayor daño estimado.

El artefacto es deliberadamente diminuto: 75 MLPs de 2.209 parámetros cada uno, 166.675 parámetros en total y 1,35 MB en disco. Frente a las versiones anteriores que se distribuían como blobs `.npz` con el contrato de features embebido en código, esta generación se publica como `.safetensors` autodescriptivos que incluyen pesos, contrato de features, normalización por familia y puntuaciones medidas en un único fichero.

La relevancia es práctica para quien cuantice modelos: la generación v5 es la primera que supera a las tablas de producción anteriores en un modelo real medido, incluido un MoE (Ling-3.0-tiny) donde la tabla previa no tenía señal de ranking alguna (−0,022 de correlación) y v5 alcanza +0,419 en ensamblado (+0,134 fuera de fold).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP tabular (75 redes independientes, una por familia/grupo) |
| Parametros totales | 166.675 (75 × 2.209) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (el modelo predice daño de cuantización, no se distribuye cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Gnom es un ranker tabular compuesto por 75 MLPs que operan sobre un contrato de features de 20 columnas por unidad (grupo de tensores). Cada red predice el daño esperado de degradar un grupo un nivel de cuantización, medido como divergencia KL frente a la referencia BF16. El artefacto de despliegue (`gnom_kfold_v5_2026-10-31.safetensors`) se entrenó con validación cruzada de 5 folds agrupados por etiqueta de unidad (todos los niveles de una unidad comparten fold, evitando fuga de información), con 3 semillas por fold. El pool de entrenamiento es el "Fracture pool" limpio de 5 familias, n=1165 unidades, tras filtrar los pines del cuantizador (tensores F32 1D, norms, ssm y rope con daño exactamente cero, sin señal).

El repositorio incluye además un ensamblado v4 entrenado con leave-one-family-out estricto (suelo conservador para arquitecturas nuevas), dos versiones históricas multinet v3 y un net v1 legacy. La innovación destacable no está en la arquitectura de las redes sino en el empaquetado: pesos, contrato de features, normalización por familia y puntuaciones medidas conviven en un solo `.safetensors`, con un loader de referencia (`load_gnom.py`) que reproduce los números del examen almacenados en el artefacto.

## Capacidades

- Predicción de daño por grupo de tensores: estima la divergencia KL esperada al degradar un grupo un nivel de cuantización.
- Ranking de grupos para asignación de presupuesto de bytes en el cuantizador MERNIK.
- Soporte de cinco familias de modelos: `rl17` (Spark-X2.5-1.7B), `rl4b` (Spark-X2.5-4B), `lfm3` (LFM3-1.7B), `rl9b` (Ornith-1.0-9B) y `ling_moe` (Ling-3.0-tiny, MoE).
- Generalización a arquitecturas nuevas vía el artefacto LOMO v4, con expectativas conservadoras.
- Autodescripción: el propio fichero contiene el contrato de features y la normalización, sin dependencias de rutas en la API `load/predict`.
- Autotest integrado que reproduce los números del examen a partir del artefacto y el pool.

## Casos de uso

- Cuantización de modelos de 1,7B a 9B con presupuesto fijo: dado un modelo de una de las cinco familias soportadas, Gnom puntúa cada grupo de tensores y el cuantizador protege los líderes de daño predicho, obteniendo mejor PPL y KLD que una tabla genérica.
- Sustitución de tablas de producción obsoletas en MoE: en Ling-3.0-tiny la tabla previa no tenía señal de ranking (−0,022); usar v5 permite por primera vez asignar presupuesto de forma informada en ese modelo.
- Exploración de una arquitectura nueva: ejecutar el artefacto LOMO v4 como suelo conservador antes de medir daño real, para decidir si merece la pena invertir en calibrar la familia.
- Integración en pipelines de compresión: el artefacto de 1,35 MB y la API `load/predict` sin dependencias de rutas permiten incorporar el ranker a un pipeline de cuantización existente sin infraestructura adicional.
- Auditoría de asignaciones: comparar la tabla de daño medida (`netpred_ling_v5_2026-10-31.json`) con las predicciones para detectar grupos donde el ranker falla y ajustar el contrato de features.
- Reproducción de experimentos: el autotest de `load_gnom.py` permite verificar en un checkout de MERNIK que el artefacto y el pool producen los números publicados antes de desplegarlo.

## Benchmarks y rendimiento

Acuerdo con el daño medido por grupo (correlación), pool Fracture de 5 familias, n=1165:

| Familia | 5-fold intra-familia (despliegue v5) | Suelo LOMO (v4, familia nueva) |
|---|---|---|
| rl17 (1,7B) | +0,738 | +0,714 |
| rl4b (4B) | +0,615 | +0,708 |
| lfm3 (3.ª arquitectura) | +0,659 | +0,522 |
| rl9b (Ornith-9B) | +0,489 | −0,169 |
| ling_moe (MoE) | +0,134 | −0,228 |
| Media | +0,527 | +0,309 |

Comparación de v5 frente a la tabla de producción anterior, mismos grupos y etiquetas:

| Modelo | Tabla de producción previa | Ensamblado v5 | OOF honesto v5 |
|---|---|---|---|
| Ornith-1.5-9B | +0,398 | +0,660 | +0,489 |
| Ling-3.0-tiny (MoE) | −0,022 | +0,419 | +0,134 |

Primer despliegue medido en Ling-3.0-tiny (wiki 297×1024, `-c 1024 -b 128 --seed 7`, misma base BF16 e imatrix):

| Build | MiB | PPL | KLD media | KLD mediana | KLD máx. |
|---|---|---|---|---|---|
| Q4_K_M stock (vendor, sin imatrix) | 4600 | 13,327 | 0,114020 | 0,048512 | 14,354789 |
| NETPURE 4500 (tabla antigua, greedy) | 4507 | 13,503 | 0,095092 | 0,039573 | 8,716 |
| v5 water-fill 4500 | 4516 | 13,0555 | 0,070794 | 0,028326 | 9,388 |
| NETPURE 5100 (tabla antigua, greedy) | 5091 | 13,4271 | 0,089046 | 0,037072 | 9,071 |
| v5 greedy top-down 5100 | 5113 | 13,1311 | 0,062827 | 0,024551 | 10,695 |
| v5 water-fill 5100 | 5116 | 13,1289 | 0,050744 | 0,019695 | 9,858 |

## Requisitos de hardware

- VRAM para inferencia: despreciable; el artefacto pesa 1,35 MB y 166.675 parámetros, cabe en CPU.
- GPU recomendadas: no requiere GPU; la inferencia es de milisegundos por lote de unidades en CPU.
- Cabe en cualquier GPU consumer y en entornos sin acelerador.
- Despliegue: carga directa con `safetensors` mediante el loader de referencia `load_gnom.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un ranker tabular).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos comparables de rankers de daño para asignación de cuantización. La comparación relevante es contra las tablas de producción anteriores del propio proyecto MERNIK, recogida en la sección de benchmarks: v5 supera a la tabla previa en Ornith-1.5-9B (+0,660 frente a +0,398 en ensamblado) y en Ling-3.0-tiny (+0,419 frente a −0,022).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni responde a prompts.
- Cobertura limitada a cinco familias conocidas; para arquitecturas nuevas debe usarse el artefacto LOMO v4, cuyo suelo es notablemente inferior (media +0,309) y negativo en rl9b (−0,169) y ling_moe (−0,228).
- La familia MoE (ling_moe) es la más débil: OOF honesto de +0,134; el +0,419 del ensamblado es optimista porque los folds comparten vecinos a través de la tabla promediada.
- En la build de 5100, v5 water-fill mejora media y mediana de KLD (−43 % y −47 % frente a NETPURE) pero empeora la cola (máx. +8,7 %); las builds greedy de NETPURE conservan el KLD máximo más bajo.
- La tabla `netpred_ornith_v5_2026-10-31.json` es generada y solo para dry-run, no medida.
- El autotest depende de rutas de laboratorio almacenadas en el fichero del pool (`gnom/features/` y etiquetas presentes); la API `load/predict` no tiene dependencias de rutas, pero la verificación completa requiere un checkout de MERNIK.
- La comprobación de generación del operador fue informal y no se ejecutó el battery de HE; no hay validación de capacidades aguas abajo.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantías de rendimiento fuera de las familias medidas.
- Riesgo de alucinación y sesgos lingüísticos: no aplicables al no ser un modelo generativo; el riesgo equivalente es una predicción de daño errónea que lleve a proteger grupos equivocados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wepiqx/MERNIK-gnom
- Proyecto MERNIK: https://huggingface.co/wepiqx/MERNIK
