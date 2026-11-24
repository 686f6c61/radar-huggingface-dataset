# Vejni/NMDetective-BPlus

## Resumen

NMDetective-B+ es un predictor interpretable y basado en reglas de la eficiencia del mecanismo de degradacion del ARNm mediada por mutaciones sin sentido (nonsense-mediated decay, NMD) para codones de terminacion prematura (PTC). Lo desarrolla Vejni y se publica bajo licencia MIT. No es una red neuronal ni un modelo de lenguaje: es un arbol de decision extendido con cinco reglas que enrutan cada PTC y devuelven una prediccion cuantitativa continua de eficiencia de NMD.

La relevancia tecnica esta en que sustituye las hojas constantes del arbol clasico NMDetective-B por funciones suaves (sigmoideas y superficies lineales) en funcion de la posicion del PTC en el transcrito. Asi, dentro de las reglas de proximidad al inicio, exon largo y frontera de 55 nt, la prediccion varia de forma continua con la posicion en lugar de saltar entre valores discretos. Utiliza unicamente la posicion del PTC, no la secuencia circundante.

El modelo se presenta como complemento interpretable de NMDetective-AI, un modelo basado en lenguaje genomico que si captura contexto de secuencia. B+ es util cuando se necesita trazabilidad completa de la prediccion y no se dispone de GPU: la inferencia es puramente aritmetica sobre un fichero JSON de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Arbol de decision basado en reglas con hojas continuas (sigmoideas y superficies lineales) |
| Parametros totales | no disponible (parametros ajustados en NMDetectiveBPlus.json: umbrales de enrutado, medias de hoja y coeficientes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular por variante, no secuencia) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (dominio biologico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | JSON (NMDetectiveBPlus.json) |

## Arquitectura y entrenamiento

La arquitectura es un arbol de decision con cinco reglas evaluadas en orden, aplicandose la primera que se cumple: `last_exon_mean` (PTC en el ultimo exon, prediccion constante -0,50), `start_sigmoid` (a 250 nt o menos del codon de inicio, sigmoidea decreciente con punto medio en ~141 nt), `long_exon_surface` (exon del PTC mayor de 407 nt, superficie lineal en logaritmo del exceso de longitud y posicion relativa en el exon), `ejc_sigmoid` (a 100 nt o menos aguas arriba de la ultima union exon-exon, sigmoidea creciente con punto medio en ~55 nt) y `baseline_mean` (resto de casos, constante +0,51).

Los parametros se ajustaron sobre 13.160 PTC somaticos y germinales de TCGA con estimaciones de eficiencia de NMD alelo-especifica. Los cromosomas 1 y 17 se reservaron para validacion y GTEx se uso como conjunto de test independiente. La escala de salida coincide con la de NMDetective-AI: eficiencia de NMD alelo-especifica reescalada de modo que los PTC canonicos que disparan NMD promedian +0,5 y los PTC en el ultimo exon promedian -0,5.

La entrada es una tabla con seis columnas derivadas de la anotacion GENCODE v26: `InLastExon`, distancia desde el inicio de la traduccion, longitud del exon contenedor, distancia al extremo 5' del exon, distancia a la ultima union exon-exon codificante y numero de uniones codificantes aguas abajo.

## Capacidades

- Prediccion cuantitativa de eficiencia de NMD para PTC en transcritos codificantes de proteina, en coordenadas GRCh38.
- Prediccion interpretable: cada valor de salida es trazable a una regla concreta y a sus coeficientes en el JSON.
- Variacion continua de la prediccion con la posicion del PTC en las reglas de inicio, exon largo y frontera de union exon-exon.
- Inferencia sin GPU y sin descarga de modelos auxiliares (no requiere Orthrus).
- Integracion en pipelines de prediccion de variantes mediante la clase `NMD.modeling.models.NMDetectiveBPlus` y el `VariantPredictor`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un predictor especifico de dominio.

## Casos de uso

- Anotacion funcional de variantes en estudios de secuenciacion: dado un VCF con variantes que generan PTC, calcular la eficiencia esperada de NMD para priorizar variantes con mayor probabilidad de escapar a la degradacion del transcrito.
- Triaje en diagnostico genomico: usar la prediccion continua para discriminar entre PTC que probablemente activan NMD y PTC en el ultimo exon que no lo hacen, sin depender de umbrales discretos.
- Analisis de datos TCGA y cohortes de cancer: estimar el impacto de PTC somaticos sobre la abundancia de transcrito y correlacionarlo con expresion medida por RNA-seq.
- Validacion e interpretacion de modelos mas complejos: comparar las predicciones de NMDetective-AI con las de B+ para identificar casos donde el contexto de secuencia altera la prediccion posicional.
- Docencia y divulgacion en biologia computacional: al ser un modelo de reglas transparente, permite explicar por que un PTC concreto activa o no NMD con una justificacion aritmetica.
- Filtrado previo en pipelines de alto rendimiento: descartar rapidamente variantes con prediccion extrema (cercanas a -0,5 o +0,5) antes de aplicar modelos con mayor coste computacional.
- Estudios de splicing y estructura de exones: usar la regla `long_exon_surface` para analizar como la longitud del exon y la posicion relativa modulan la eficiencia de NMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU exclusivamente: no requiere GPU ni descarga de Orthrus al ejecutar B+ en solitario.
- Memoria: el modelo son parametros en un fichero JSON, por lo que el consumo es despreciable frente a cualquier modelo neuronal.
- GPU recomendadas: no aplica.
- Cabe en cualquier maquina, incluidos portatiles de gama baja y entornos sin acelerador.
- Despliegue mediante el paquete Python del repositorio (clase `NMDetectiveBPlus` o CLI `main.py predict variant ...`); no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma explicita; al ser evaluacion aritmetica de reglas, el coste por variante es minimo.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Contexto de secuencia | Interpretabilidad | Licencia |
|---|---|---|---|---|---|
| NMDetective-B+ | Arbol de reglas con hojas continuas | Posicion del PTC | No | Total (reglas explicitas) | MIT |
| NMDetective-B | Arbol de decision clasico | Posicion del PTC | No | Total (hojas constantes) | no disponible |
| NMDetective-AI | Modelo de lenguaje genomico | Secuencia | Si (stop codon, codones flanqueantes, reinicio aguas abajo) | Parcial | no disponible |

## Limitaciones y advertencias

- Ignora el contexto de secuencia: identidad del codon de parada, codones flanqueantes y reinicio de la traduccion aguas abajo, que si captura NMDetective-AI.
- Ambito restringido a PTC en transcritos codificantes de proteina en coordenadas GRCh38.
- Uso exclusivo en investigacion; la model card indica "research use only" pese a la licencia MIT.
- Depende de la calidad y version de la anotacion GENCODE v26 para calcular las columnas de entrada.
- No es un modelo de lenguaje: no genera texto, no razona y no debe emplearse fuera de la prediccion de eficiencia de NMD.
- Riesgo de alucinacion y sesgos linguisticos: no aplica por la naturaleza del modelo; el riesgo principal es la extrapolacion a distribuciones de variantes distintas de las de entrenamiento (TCGA y GTEx).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vejni/NMDetective-BPlus
- Modelo complementario NMDetective-AI: https://huggingface.co/Vejni/NMDetective-AI
- Codigo: https://github.com/Vejni/NMDetectiveAI
- Paper (bioRxiv, preprint 2026): https://www.biorxiv.org/content/10.64898/2026.03.24.714003v1
- DOI: 10.64898/2026.03.24.714003
