# VSRAJHAVEL/BioGraph-AI-Models

## Resumen

BioGraph-AI-Models es una colección de pesos preentrenados de modelos de aprendizaje automático sobre grafos moleculares, publicada por VSRAJHAVEL (Rajhavel V S) en Hugging Face. No se trata de un modelo de lenguaje, sino de un conjunto de checkpoints para predicción de propiedades moleculares y perfilado ADMET (absorción, distribución, metabolismo, excreción y toxicidad) en el contexto del diseño de fármacos asistido por computador (CADD). El repositorio agrupa 15 arquitecturas de grafos y baselines clásicos evaluados sobre tres benchmarks canónicos de MoleculeNet: ESOL (solubilidad acuosa), BBBP (penetración de la barrera hematoencefálica) y Tox21 (toxicidad multitarea).

El paquete incluye implementaciones de Message Passing Neural Networks (MPNN), Graph Isomorphism Networks (GIN), Graph Convolutional Networks (GCN) y Graph Attention Networks (GAT), además de baselines de Random Forest con fingerprints de Morgan (ECFP4 de 2048 bits). Todos los modelos se evaluaron bajo una partición por scaffolds de Bemis-Murcko en proporción 80/10/10, lo que evita la fuga de información estructural entre entrenamiento y test, una práctica crítica en química computacional que muchos trabajos académicos descuidan.

La relevancia de esta publicación radica en su utilidad práctica para equipos de descubrimiento de fármacos que necesitan modelos de referencia reproducibles y ligeros (el repositorio completo ocupa aproximadamente 0,1 GB). Los checkpoints están en formato PyTorch (`.pt` para redes neuronales y `.pkl` para los baselines), lo que permite cargarlos directamente con `torch.load` y `huggingface_hub`. La licencia MIT facilita su integración en pipelines comerciales de química computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNN, GIN, GCN, GAT y Random Forest (baseline) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo sobre grafos moleculares) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (documentación y metadatos) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) y pickle (`.pkl` para Random Forest) |

## Arquitectura y entrenamiento

El repositorio contiene cinco familias de modelos. Las MPNN emplean funciones de mensaje condicionadas por una red de aristas, `M(h_v, h_w, e_vw)`, que incorporan información de estereoquímica de enlace, conjugación y aromaticidad; según el autor, son las que mejor rinden en propiedades termodinámicas dependientes de efectos estéricos. Las GIN usan agregación por suma con perceptrones multicapa que aproximan el test de isomorfismo de grafos 1-Weisfeiler-Lehman. Las GCN aplican convoluciones espectrales localizadas de primer orden con el laplaciano simétricamente normalizado. Las GAT incorporan atención multi-cabeza parametrizada con LeakyReLU sobre vecindades de enlace. Los baselines de Random Forest usan 500 estimadores sobre fingerprints ECFP4 de 2048 bits (radio de Morgan 2).

El entrenamiento se realizó sobre CPU Intel local y la partición de datos siguió el esquema de Bemis-Murcko con proporción 80/10/10, verificándose matemáticamente la ausencia de fuga de scaffolds entre entrenamiento y test. No se especifican en la información disponible el número de épocas, la tasa de aprendizaje, el tamaño de batch ni detalles de regularización. Tampoco se documenta si hubo ajuste fino adicional sobre los conjuntos de MoleculeNet más allá del entrenamiento supervisado estándar.

## Capacidades

- Predicción de solubilidad acuosa (regresión de logS en mol/L) sobre moléculas representadas como grafos.
- Clasificación binaria de penetración de la barrera hematoencefálica (BBBP).
- Clasificación multitarea de toxicidad sobre 12 vías de receptores nucleares y respuesta al estrés (Tox21), con enmascaramiento de etiquetas ausentes.
- Representación de moléculas mediante grafos con atributos de enlace (estereoquímica, aromaticidad, conjugación).
- Extracción de fingerprints ECFP4 para los baselines de Random Forest.
- Integración con RDKit para parsing y featurización de SMILES.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales.
- No dispone de modo de razonamiento extendido ni de ventana de contexto lingüístico.

## Casos de uso

- Filtrado temprano de solubilidad en cribados virtuales: el checkpoint MPNN de ESOL (RMSE 1,010) permite descartar compuestos con baja solubilidad acuosa prevista antes de sintetizarlos, reduciendo costes experimentales en fases iniciales de descubrimiento.
- Priorización de candidatos con acceso al sistema nervioso central: el baseline de Random Forest para BBBP (ROC-AUC 0,853) sirve como filtro rápido para seleccionar moléculas con probabilidad alta de atravesar la barrera hematoencefálica en proyectos de neurología.
- Evaluación de toxicidad temprana en pipelines ADMET: el MPNN de Tox21 (ROC-AUC 0,757) permite estimar riesgo sobre 12 vías simultáneamente, útil para descartar compuestos con perfiles de toxicidad desfavorables antes de ensayos in vitro.
- Enriquecimiento de bases de datos internas de compuestos: cargando los checkpoints con `hf_hub_download` y `torch.load`, un equipo puede anotar automáticamente catálogos de moléculas con predicciones de solubilidad, permeabilidad y toxicidad.
- Benchmarking interno de nuevas arquitecturas: los resultados publicados con partición Bemis-Murcko sirven como línea base reproducible contra la que comparar modelos propios de GNN en química.
- Docencia y experimentación en química computacional: el reducido tamaño del repositorio (0,1 GB) y la licencia MIT permiten usar estos pesos en cursos y proyectos académicos sin restricciones.
- Integración en herramientas de optimización bioisostérica: combinado con el ecosistema RDKit, el modelo puede puntuar variantes estructurales de un compuesto líder según sus propiedades predichas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), con partición Bemis-Murcko 80/10/10.

Solubilidad acuosa (ESOL, regresión de logS):

| Modelo | RMSE test | MAE test | R² test |
|---|---|---|---|
| MPNN (edge-aware) | 1,010 | 0,777 | 0,784 |
| GIN (Weisfeiler-Lehman) | 1,054 | 0,812 | 0,764 |
| GCN (Kipf-Welling) | 1,080 | 0,811 | 0,753 |
| Baseline RF + Morgan | 1,109 | 0,859 | 0,739 |
| GAT (multi-head) | 1,208 | 0,938 | 0,691 |

Penetración de barrera hematoencefálica (BBBP, clasificación binaria):

| Modelo | ROC-AUC test | PR-AUC test |
|---|---|---|
| Baseline RF + Morgan | 0,853 | 0,978 |
| GIN | 0,723 | 0,936 |
| GCN | 0,719 | 0,951 |
| MPNN | 0,665 | 0,944 |
| GAT | 0,624 | 0,928 |

Toxicidad multitarea (Tox21, 12 vías):

| Modelo | ROC-AUC test | PR-AUC test |
|---|---|---|
| MPNN (edge-aware) | 0,757 | 0,304 |
| GCN | 0,754 | 0,310 |
| GIN | 0,747 | 0,306 |
| Baseline RF | 0,730 | 0,349 |
| GAT | 0,711 | 0,264 |

## Requisitos de hardware

- Al tratarse de modelos sobre grafos moleculares de pequeño tamaño, la inferencia es extremadamente ligera: los checkpoints caben holgadamente en memoria RAM convencional y no requieren GPU.
- El autor indica que el entrenamiento y la evaluación se realizaron sobre hilos físicos de CPU Intel, lo que confirma que el entrenamiento es viable sin acelerador.
- Cualquier GPU consumer moderna (RTX 3060 o superior) acelera el entrenamiento y la inferencia por lotes, aunque no es imprescindible.
- Despliegue mediante PyTorch nativo y PyTorch Geometric; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Dependencias principales: `torch`, `torch-geometric`, `rdkit` y `huggingface_hub`.
- No se publican datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BioGraph-AI-Models (este) | GNN sobre grafos moleculares (MPNN/GIN/GCN/GAT + RF) | no aplica | ESOL RMSE 1,010; BBBP ROC-AUC 0,853; Tox21 ROC-AUC 0,757 | MIT | Hugging Face |
| Chemprop (D-MPNN) | MPNN dirigida | no aplica | Referencia habitual en MoleculeNet; valores no disponibles en esta ficha | MIT | GitHub/PyPI |
| AttentiveFP | GAT con atención sobre átomos y enlaces | no aplica | Referencia en MoleculeNet; valores no disponibles en esta ficha | MIT | GitHub |
| Grover | Transformer sobre grafos con preentrenamiento | no aplica | Referencia en MoleculeNet; valores no disponibles en esta ficha | MIT | GitHub |

No se dispone de datos verificados de los modelos comparables en la información proporcionada; las cifras de esta ficha corresponden únicamente a los resultados declarados por el autor de BioGraph-AI-Models.

## Limitaciones y advertencias

- Los benchmarks declarados no están verificados de forma independiente (`verified: false`); deben tratarse como resultados del autor y no como cifras auditadas.
- El rendimiento en BBBP es inferior al de un baseline clásico de Random Forest con fingerprints de Morgan, lo que sugiere que las GNN incluidas no superan sistemáticamente a métodos tradicionales en clasificación binaria con datasets pequeños.
- Los modelos se entrenaron únicamente sobre tres conjuntos de MoleculeNet (ESOL, BBBP, Tox21); su generalización a otras propiedades o dominios químicos no está documentada.
- No se especifican tamaños de modelo, hiperparámetros ni detalles completos de entrenamiento, lo que dificulta la reproducibilidad exacta.
- Riesgo de alucinación en el sentido de predicciones sobreestimas o extrapolaciones fuera del dominio de aplicabilidad; no hay mecanismos de calibración ni de detección de fuera de distribución documentados.
- No se documentan sesgos conocidos ni análisis de equidad; los datasets de MoleculeNet tienen cobertura química limitada y sesgos de selección propios.
- La licencia MIT permite uso comercial, pero no se ofrece garantía alguna sobre la idoneidad clínica o regulatoria de las predicciones.
- El repositorio no incluye pipeline de inferencia listo para producción; el usuario debe construir el featurizado con RDKit y PyTorch Geometric.
- El idioma de la documentación es inglés; no hay soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VSRAJHAVEL/BioGraph-AI-Models
- Repositorio GitHub del proyecto: https://github.com/VSRAJHAVEL/BioGraph-AI
- Portfolio del autor: https://vsrajhavel.github.io
- LinkedIn del autor: https://in.linkedin.com/in/rajhavelvs
- GitHub del autor: https://github.com/VSRAJHAVEL
- PyTorch: https://pytorch.org/
- PyTorch Geometric: https://pyg.org/
- RDKit: https://www.rdkit.org/
- Licencia MIT: https://opensource.org/licenses/MIT
